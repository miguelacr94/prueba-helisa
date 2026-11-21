import type { AccountingMovementOrmEntity } from '../../infrastructure/persistence/sqlite/entities/accounting-movement.orm-entity.js';

export interface CreateMovementCommand {
  accountCode: string;
  concept: string;
  debit?: number;
  credit?: number;
}

export interface AccountingMovementRepositoryPort {
  save(command: CreateMovementCommand): Promise<AccountingMovementOrmEntity>;
  findByAccountCode(accountCode: string): Promise<AccountingMovementOrmEntity[]>;
  hasMovements(accountCode: string): Promise<boolean>;
}

