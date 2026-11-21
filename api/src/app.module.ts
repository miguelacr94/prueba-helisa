import { Module } from '@nestjs/common';
import { GatewayModule } from './gateway/gateway.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [GatewayModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
