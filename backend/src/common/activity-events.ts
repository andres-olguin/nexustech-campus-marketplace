import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
/** Best effort after commit: Mongo listeners cannot roll back SQL. */
@Injectable()
export class ActivityEvents {
  private readonly logger = new Logger(ActivityEvents.name);
  constructor(private readonly events: EventEmitter2) {}
  publish(name: string, userId: string, resourceId: string) {
    try {
      void this.events.emitAsync(name, { userId, resourceId, occurredAt: new Date().toISOString() })
        .catch(() => this.logger.warn(`Activity listener failed: ${name}`));
    } catch { this.logger.warn(`Activity listener failed: ${name}`); }
  }
}
