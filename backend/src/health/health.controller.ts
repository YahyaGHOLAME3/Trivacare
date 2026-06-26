import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  @Public()
  @Get()
  async check() {
    await this.connection.db?.admin().ping();

    return {
      status: 'ok',
      database: this.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}
