import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MongoClient, Db, Collection } from 'mongodb';
import { ActivityLogDocument, InteractionDocument } from './activity.types';
import { CreateInteractionDto } from './activity.dto';

@Injectable()
export class ActivityService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ActivityService.name);
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private activityCol: Collection<ActivityLogDocument> | null = null;
  private interactionsCol: Collection<InteractionDocument> | null = null;

  async onModuleInit() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexustech';
    const dbName = process.env.MONGODB_DB_NAME || 'nexustech';

    try {
      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      await this.client.connect();
      this.db = this.client.db(dbName);
      this.activityCol = this.db.collection<ActivityLogDocument>('activity_logs');
      this.interactionsCol = this.db.collection<InteractionDocument>('interactions');

      // Crear índices para optimizar consultas de auditoría e interacciones
      await this.activityCol.createIndex({ resourceId: 1, occurredAt: -1 });
      await this.activityCol.createIndex({ userId: 1, occurredAt: -1 });
      await this.interactionsCol.createIndex({ targetId: 1, createdAt: -1 });
      await this.interactionsCol.createIndex({ senderId: 1 });

      this.logger.log(`Conectado exitosamente a MongoDB (Base de datos: ${dbName})`);
    } catch (err: any) {
      this.logger.warn(`No se pudo conectar a MongoDB (${uri}): ${err.message}. El backend continuará operando; la auditoría NoSQL estará en espera.`);
      this.client = null;
      this.db = null;
      this.activityCol = null;
      this.interactionsCol = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.close();
        this.logger.log('Conexión con MongoDB cerrada.');
      } catch (err: any) {
        this.logger.warn(`Error cerrando conexión MongoDB: ${err.message}`);
      }
    }
  }

  // --- Listeners de Eventos del Ciclo de Vida SQL (Desacoplados tras commit) ---

  @OnEvent('product.created')
  async handleProductCreated(payload: { userId: string; resourceId: string; occurredAt: string }) {
    await this.recordActivity('product.created', payload);
  }

  @OnEvent('product.updated')
  async handleProductUpdated(payload: { userId: string; resourceId: string; occurredAt: string }) {
    await this.recordActivity('product.updated', payload);
  }

  @OnEvent('order.created')
  async handleOrderCreated(payload: { userId: string; resourceId: string; occurredAt: string }) {
    await this.recordActivity('order.created', payload);
  }

  @OnEvent('order.cancelled')
  async handleOrderCancelled(payload: { userId: string; resourceId: string; occurredAt: string }) {
    await this.recordActivity('order.cancelled', payload);
  }

  @OnEvent('order.fulfillment.updated')
  async handleFulfillmentUpdated(payload: {
    userId: string;
    resourceId: string;
    occurredAt: string;
    sellerId: string;
    status: string;
    orderStatus: string;
  }) {
    const { sellerId, status, orderStatus, ...base } = payload;
    await this.recordActivity('order.fulfillment.updated', base, { sellerId, status, orderStatus });
  }

  /**
   * Persistencia en MongoDB con aislamiento estricto:
   * Si MongoDB no está disponible, captura el error y registra advertencia sin afectar PostgreSQL.
   */
  async recordActivity(eventName: string, base: { userId: string; resourceId: string; occurredAt: string }, metadata?: Record<string, any>): Promise<void> {
    if (!this.activityCol) {
      this.logger.debug(`MongoDB inactivo, omitiendo persistencia de evento ${eventName}`);
      return;
    }
    try {
      const doc: ActivityLogDocument = {
        eventName,
        userId: base.userId,
        resourceId: base.resourceId,
        occurredAt: base.occurredAt || new Date().toISOString(),
        metadata: metadata || {},
      };
      await this.activityCol.insertOne(doc as any);
    } catch (err: any) {
      this.logger.warn(`Error al persistir auditoría NoSQL (${eventName}): ${err.message}`);
    }
  }

  // --- Operaciones de Interacciones y Conversaciones (Marketplace Comprador-Vendedor) ---

  async createInteraction(senderId: string, dto: CreateInteractionDto): Promise<InteractionDocument> {
    const doc: InteractionDocument = {
      targetId: dto.targetId,
      targetType: dto.targetType,
      senderId,
      receiverId: dto.receiverId,
      message: dto.message.trim(),
      createdAt: new Date().toISOString(),
    };

    if (this.interactionsCol) {
      try {
        const result = await this.interactionsCol.insertOne(doc as any);
        return { ...doc, _id: result.insertedId };
      } catch (err: any) {
        this.logger.warn(`Error al guardar interacción en MongoDB: ${err.message}`);
      }
    }
    return doc;
  }

  async getInteractionsByTarget(targetId: string, limit: number = 20): Promise<InteractionDocument[]> {
    if (!this.interactionsCol) return [];
    try {
      return await this.interactionsCol
        .find({ targetId })
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 100))
        .toArray();
    } catch (err: any) {
      this.logger.warn(`Error al consultar interacciones por target: ${err.message}`);
      return [];
    }
  }

  async getInteractionsByUser(userId: string, limit: number = 20): Promise<InteractionDocument[]> {
    if (!this.interactionsCol) return [];
    try {
      return await this.interactionsCol
        .find({ $or: [{ senderId: userId }, { receiverId: userId }] })
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 100))
        .toArray();
    } catch (err: any) {
      this.logger.warn(`Error al consultar interacciones por usuario: ${err.message}`);
      return [];
    }
  }

  async getActivityLogs(resourceId: string, limit: number = 20): Promise<ActivityLogDocument[]> {
    if (!this.activityCol) return [];
    try {
      return await this.activityCol
        .find({ resourceId })
        .sort({ occurredAt: -1 })
        .limit(Math.min(limit, 100))
        .toArray();
    } catch (err: any) {
      this.logger.warn(`Error al consultar logs de actividad: ${err.message}`);
      return [];
    }
  }

  async getUserActivityLogs(userId: string, limit: number = 20): Promise<ActivityLogDocument[]> {
    if (!this.activityCol) return [];
    try {
      return await this.activityCol
        .find({ userId })
        .sort({ occurredAt: -1 })
        .limit(Math.min(limit, 100))
        .toArray();
    } catch (err: any) {
      this.logger.warn(`Error al consultar actividad del usuario: ${err.message}`);
      return [];
    }
  }
}
