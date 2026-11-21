import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountingMovementOrmEntity } from '../entities/accounting-movement.orm-entity.js';
import type {
  AccountingMovementRepositoryPort,
  CreateMovementCommand,
} from '../../../../domain/ports/accounting-movement.repository.port.js';

@Injectable()
export class SqliteMovementRepository implements AccountingMovementRepositoryPort {
  constructor(
    @InjectRepository(AccountingMovementOrmEntity)
    private readonly repository: Repository<AccountingMovementOrmEntity>,
  ) {}

  async save(command: CreateMovementCommand): Promise<AccountingMovementOrmEntity> {
    const movement = this.repository.create({
      accountCode: command.accountCode,
      concept: command.concept,
      debit: command.debit ?? 0,
      credit: command.credit ?? 0,
    });
    return this.repository.save(movement);
  }

  async findByAccountCode(accountCode: string): Promise<AccountingMovementOrmEntity[]> {
    return this.repository.find({
      where: { accountCode },
      order: { createdAt: 'DESC' },
    });
  }

  async hasMovements(accountCode: string): Promise<boolean> {
    const count = await this.repository.count({ where: { accountCode } });
    return count > 0;
  }
}

