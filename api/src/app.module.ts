import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv } from './config/env.schema.js';
import { GatewayModule } from './gateway/gateway.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AccountOrmEntity } from './modules/accounts/infrastructure/persistence/sqlite/entities/account.orm-entity.js';
import { AccountingMovementOrmEntity } from './modules/accounts/infrastructure/persistence/sqlite/entities/accounting-movement.orm-entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH || 'puc.sqlite',
      entities: [AccountOrmEntity, AccountingMovementOrmEntity],
      synchronize: true,
      logging: false,
    }),
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
