import { Inject, Injectable } from '@nestjs/common';
import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port.js';
import type { AccountingMovementRepositoryPort } from '../../domain/ports/accounting-movement.repository.port.js';
import {
  ACCOUNT_REPOSITORY_TOKEN,
  ACCOUNTING_MOVEMENT_REPOSITORY_TOKEN,
} from '../../accounts.tokens.js';
import {
  AccountDoesNotAcceptMovementsException,
  AccountNotFoundException,
} from '../../domain/exceptions/account-domain.exception.js';

export interface RecordMovementCommand {
  accountCode: string;
  concept: string;
  debit?: number;
  credit?: number;
}

export interface AccountingMovementOutput {
  id: string;
  accountCode: string;
  concept: string;
  debit: number;
  credit: number;
  createdAt: string;
}

@Injectable()
export class RecordMovementUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly accountRepository: AccountRepositoryPort,
    @Inject(ACCOUNTING_MOVEMENT_REPOSITORY_TOKEN)
    private readonly movementRepository: AccountingMovementRepositoryPort,
  ) {}

  async execute(command: RecordMovementCommand): Promise<AccountingMovementOutput> {
    const code = command.accountCode.trim();
    const account = await this.accountRepository.findByCode(code);
    if (!account) {
      throw new AccountNotFoundException(code);
    }

    // Regla de Negocio Crítica del PUC: Solo las cuentas sin hijas admiten movimientos contables
    const hasChildren = await this.accountRepository.hasChildren(code);
    if (hasChildren || account.hasChildren || !account.acceptsMovements()) {
      throw new AccountDoesNotAcceptMovementsException(code);
    }

    const saved = await this.movementRepository.save({
      accountCode: code,
      concept: command.concept.trim(),
      debit: Number(command.debit ?? 0),
      credit: Number(command.credit ?? 0),
    });

    return {
      id: saved.id,
      accountCode: saved.accountCode,
      concept: saved.concept,
      debit: Number(saved.debit),
      credit: Number(saved.credit),
      createdAt: saved.createdAt.toISOString(),
    };
  }
}

