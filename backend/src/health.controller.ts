import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activity/activity.service';
import { DataSource } from 'typeorm';
@ApiTags('health') @Controller('health')
export class HealthController {
  constructor(private readonly db: DataSource, private readonly activity: ActivityService) {}
  @Get('ready') async ready() {
    await this.health();
    await this.activity.checkConnection();
    return { status: 'ok', database: 'up', mongodb: 'up' };
  }
  @Get() async health() {
    try { await this.db.query('SELECT 1'); return { status: 'ok', database: 'up' }; }
    catch { throw new ServiceUnavailableException('Base de datos no disponible'); }
  }
}
