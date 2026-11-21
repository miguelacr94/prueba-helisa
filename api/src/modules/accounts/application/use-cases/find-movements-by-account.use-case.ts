import { Inject, Injectable } from '@nestjs/common';
import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port.js';
import type { AccountingMovementRepositoryPort } from '../../domain/ports/accounting-movement.repository.port.js';
import {
  ACCOUNT_REPOSITORY_TOKEN,
  ACCOUNTING_MOVEMENT_REPOSITORY_TOKEN,
} from '../../accounts.tokens.js';
import { AccountNotFoundException } from '../../domain/exceptions/account-domain.exception.js';
import type { AccountingMovementOutput } from './record-movement.use-case.js';

@Injectable()
export class FindMovementsByAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly accountRepository: AccountRepositoryPort,
    @Inject(ACCOUNTING_MOVEMENT_REPOSITORY_TOKEN)
    private readonly movementRepository: AccountingMovementRepositoryPort,
  ) {}

  async execute(accountCode: string): Promise<AccountingMovementOutput[]> {
    const code = accountCode.trim();
    const account = await this.accountRepository.findByCode(code);
    if (!account) {
      throw new AccountNotFoundException(code);
    }

    const movements = await this.movementRepository.findByAccountCode(code);
    return movements.map((m) => ({
      id: m.id,
      accountCode: m.accountCode,
      concept: m.concept,
      debit: Number(m.debit),
      credit: Number(m.credit),
      createdAt: m.createdAt.toISOString(),
    }));
  }
}

