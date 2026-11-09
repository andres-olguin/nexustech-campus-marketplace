import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
@ApiTags('health') @Controller('health')
export class HealthController {
  constructor(private readonly db: DataSource) {}
  @Get() async health() {
    try { await this.db.query('SELECT 1'); return { status: 'ok', database: 'up' }; }
    catch { throw new ServiceUnavailableException('Base de datos no disponible'); }
  }
}
