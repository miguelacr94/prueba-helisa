import { Module } from '@nestjs/common';
import { AccountsModule } from '../modules/accounts/accounts.module.js';
import { AccountsGatewayController } from './controllers/accounts-gateway.controller.js';
import { HealthGatewayController } from './controllers/health-gateway.controller.js';
import { GatewayExceptionFilter } from './filters/gateway-exception.filter.js';
import { TransformResponseInterceptor } from './interceptors/transform-response.interceptor.js';

@Module({
  imports: [AccountsModule],
  controllers: [AccountsGatewayController, HealthGatewayController],
  providers: [GatewayExceptionFilter, TransformResponseInterceptor],
  exports: [GatewayExceptionFilter, TransformResponseInterceptor],
})
export class GatewayModule {}

