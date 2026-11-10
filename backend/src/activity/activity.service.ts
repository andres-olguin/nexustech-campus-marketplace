import { Injectable, Logger, OnModuleDestroy, OnModuleInit, ServiceUnavailableException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Product, Order, OrderItem, User, ActivityOutbox } from '../database/entities';
import { MongoClient, Db, Collection } from 'mongodb';
import { ActivityLogDocument, InteractionDocument } from './activity.types';
import { CreateInteractionDto } from './activity.dto';

@Injectable()
export class ActivityService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly sql: DataSource) {}

  private timer?: ReturnType<typeof setInterval>;
  private drainPromise?: Promise<void>;
  private stopping = false;
  private readonly logger = new Logger(ActivityService.name);
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private activityCol: Collection<ActivityLogDocument> | null = null;
  private interactionsCol: Collection<InteractionDocument> | null = null;

  async onModuleInit() {
    await this.connect();
    this.timer = setInterval(() => { void this.flushOutbox(); }, 2000);
    this.timer.unref();
  }

  private async connect() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexustech';
    const dbName = process.env.MONGODB_DB_NAME || 'nexustech';

    try {
      this.client = new MongoClient(uri, {
        socketTimeoutMS: 5000,
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      await this.client.connect();
      this.db = this.client.db(dbName);
      this.activityCol = this.db.collection<ActivityLogDocument>('activity_logs');
      this.interactionsCol = this.db.collection<InteractionDocument>('interactions');

      // Crear índices para optimizar consultas de auditoría e interacciones
      await this.activityCol.createIndex({ eventId: 1 }, { unique: true, sparse: true });
      await this.activityCol.createIndex({ resourceId: 1, userId: 1, occurredAt: -1 });
      await this.activityCol.createIndex({ userId: 1, occurredAt: -1 });
      await this.interactionsCol.createIndex({ targetId: 1, createdAt: -1 });
      await this.interactionsCol.createIndex({ senderId: 1, createdAt: -1 });
      await this.interactionsCol.createIndex({ receiverId: 1, createdAt: -1 });

      this.logger.log(`Conectado exitosamente a MongoDB (Base de datos: ${dbName})`);
    } catch (err: any) {
      this.logger.error('MongoDB unavailable; activity returns 503 and SQL outbox retains pending events');
      await this.client?.close();
      this.client = null;
      this.db = null;
      this.activityCol = null;
      this.interactionsCol = null;
    }
  }

  async onModuleDestroy() {
    this.stopping = true;
    if (this.timer) clearInterval(this.timer);
    await this.drainPromise;
    if (this.client) {
      try {
        await this.client.close();
        this.logger.log('Conexión con MongoDB cerrada.');
      } catch (err: any) {
        this.logger.warn(`Error cerrando conexión MongoDB: ${err.message}`);
      }
    }
  }

  /** At-least-once delivery; stable SQL event UUID prevents duplicate Mongo documents. */
  flushOutbox(): Promise<void> {
    if (this.stopping) return Promise.resolve();
    return this.drainPromise ??= this.drainOutbox().finally(() => { this.drainPromise = undefined; });
  }

  private async drainOutbox() {
    try {
      if (!this.activityCol) await this.connect();
      if (!this.activityCol) return;
      const pending = await this.sql.getRepository(ActivityOutbox).find({ order: { createdAt: 'ASC' }, take: 100 });
      for (const event of pending) {
        await this.activityCol.updateOne({ eventId: event.id }, { $setOnInsert: {
          eventId: event.id, eventName: event.eventName, userId: event.userId,
          resourceId: event.resourceId, occurredAt: event.createdAt.toISOString(), metadata: event.metadata,
        } }, { upsert: true });
        await this.sql.getRepository(ActivityOutbox).delete(event.id);
      }
    } catch { this.logger.error('Outbox delivery failed; pending SQL events retained for retry'); }

  }

  async checkConnection() {
    if (!this.db) throw new ServiceUnavailableException('MongoDB no disponible');
    try { await this.db.command({ ping: 1 }); }
    catch { throw new ServiceUnavailableException('MongoDB no disponible'); }
  }

  async createInteraction(senderId: string, dto: CreateInteractionDto): Promise<InteractionDocument> {
    if (!this.interactionsCol) throw new ServiceUnavailableException('MongoDB no disponible');
    await this.authorizeInteraction(senderId, dto);
    if (dto.message.trim().length < 2) throw new BadRequestException('Mensaje vacio');
    const doc: InteractionDocument = {
      targetId: dto.targetId,
      targetType: dto.targetType,
      senderId,
      receiverId: dto.receiverId,
      message: dto.message.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await this.interactionsCol.insertOne(doc);
      return { ...doc, _id: result.insertedId };
    } catch {
      throw new ServiceUnavailableException('No se pudo guardar el mensaje');
    }
  }

  private async authorizeInteraction(senderId: string, dto: CreateInteractionDto) {
    if (!dto.receiverId || dto.receiverId === senderId || !await this.sql.getRepository(User).existsBy({ id: dto.receiverId })) {
      throw new BadRequestException('Destinatario invalido');
    }
    if (dto.targetType === 'product') {
      const product = await this.sql.getRepository(Product).findOneBy({ id: dto.targetId });
      if (!product || ![senderId, dto.receiverId].includes(product.sellerId)) throw new ForbiddenException('El vendedor debe participar');
    } else {
      const order = await this.sql.getRepository(Order).findOneBy({ id: dto.targetId });
      const sellerId = order?.userId === senderId ? dto.receiverId : senderId;
      if (!order || ![senderId, dto.receiverId].includes(order.userId) ||
          !await this.sql.getRepository(OrderItem).existsBy({ orderId: dto.targetId, sellerId })) {
        throw new ForbiddenException('Participantes ajenos al pedido');
      }
    }
  }

  async getInteractionsByTarget(targetId: string, userId: string, limit: number = 20): Promise<InteractionDocument[]> {
    if (!this.interactionsCol) throw new ServiceUnavailableException('MongoDB no disponible');
    try {
      return await this.interactionsCol
        .find({ targetId, $or: [{ senderId: userId }, { receiverId: userId }] })
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 100))
        .toArray();
    } catch (err: any) {
      this.logger.warn(`Error al consultar interacciones por target: ${err.message}`);
      throw new ServiceUnavailableException('No se pudo consultar MongoDB');
    }
  }

  async getInteractionsByUser(userId: string, limit: number = 20): Promise<InteractionDocument[]> {
    if (!this.interactionsCol) throw new ServiceUnavailableException('MongoDB no disponible');
    try {
      return await this.interactionsCol
        .find({ $or: [{ senderId: userId }, { receiverId: userId }] })
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 100))
        .toArray();
    } catch (err: any) {
      this.logger.warn(`Error al consultar interacciones por usuario: ${err.message}`);
      throw new ServiceUnavailableException('No se pudo consultar MongoDB');
    }
  }

  async getActivityLogs(resourceId: string, userId: string, limit: number = 20): Promise<ActivityLogDocument[]> {
    if (!this.activityCol) throw new ServiceUnavailableException('MongoDB no disponible');
    try {
      return await this.activityCol
        .find({ resourceId, userId })
        .sort({ occurredAt: -1 })
        .limit(Math.min(limit, 100))
        .toArray();
    } catch (err: any) {
      this.logger.warn(`Error al consultar logs de actividad: ${err.message}`);
      throw new ServiceUnavailableException('No se pudo consultar MongoDB');
    }
  }

  async getUserActivityLogs(userId: string, limit: number = 20): Promise<ActivityLogDocument[]> {
    if (!this.activityCol) throw new ServiceUnavailableException('MongoDB no disponible');
    try {
      return await this.activityCol
        .find({ userId })
        .sort({ occurredAt: -1 })
        .limit(Math.min(limit, 100))
        .toArray();
    } catch (err: any) {
      this.logger.warn(`Error al consultar actividad del usuario: ${err.message}`);
      throw new ServiceUnavailableException('No se pudo consultar MongoDB');
    }
  }
}
