import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ActivityOutbox } from '../database/entities';
/** Call inside the same SQL transaction as the business mutation. */
@Injectable()
export class ActivityEvents {
  async enqueue(em: EntityManager, eventName: string, userId: string, resourceId: string, metadata: Record<string, unknown> = {}) {
    await em.save(ActivityOutbox, em.create(ActivityOutbox, { eventName, userId, resourceId, metadata }));
  }
}
