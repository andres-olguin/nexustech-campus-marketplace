import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ActivityOutbox } from '../database/entities';
/** Guardar este evento dentro de la misma transacción SQL que modifica el pedido. */
@Injectable()
export class ActivityEvents {
  async enqueue(em: EntityManager, eventName: string, userId: string, resourceId: string, metadata: Record<string, unknown> = {}) {
    await em.save(ActivityOutbox, em.create(ActivityOutbox, { eventName, userId, resourceId, metadata }));
  }
}
