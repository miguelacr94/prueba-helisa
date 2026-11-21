import { beforeEach, describe, expect, it } from 'vitest';
import { RecordMovementUseCase } from './record-movement.use-case.js';
import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/in-memory-account.repository.js';
import { Account } from '../../domain/entities/account.entity.js';
import { AccountNature } from '../../domain/enums/account-nature.enum.js';
import {
  AccountDoesNotAcceptMovementsException,
  AccountNotFoundException,
} from '../../domain/exceptions/account-domain.exception.js';
import type {
  AccountingMovementRepositoryPort,
  CreateMovementCommand,
} from '../../domain/ports/accounting-movement.repository.port.js';
import type { AccountingMovementOrmEntity } from '../../infrastructure/persistence/sqlite/entities/accounting-movement.orm-entity.js';

class InMemoryMovementRepository implements AccountingMovementRepositoryPort {
  private movements: AccountingMovementOrmEntity[] = [];

  async save(command: CreateMovementCommand): Promise<AccountingMovementOrmEntity> {
    const entity = {
      id: `mov-${this.movements.length + 1}`,
      accountCode: command.accountCode,
      concept: command.concept,
      debit: command.debit ?? 0,
      credit: command.credit ?? 0,
      createdAt: new Date(),
    } as AccountingMovementOrmEntity;
    this.movements.push(entity);
    return entity;
  }

  async findByAccountCode(accountCode: string): Promise<AccountingMovementOrmEntity[]> {
    return this.movements.filter((m) => m.accountCode === accountCode);
  }

  async hasMovements(accountCode: string): Promise<boolean> {
    return this.movements.some((m) => m.accountCode === accountCode);
  }
}

describe('RecordMovementUseCase', () => {
  let accountRepo: InMemoryAccountRepository;
  let movementRepo: InMemoryMovementRepository;
  let useCase: RecordMovementUseCase;

  beforeEach(async () => {
    accountRepo = new InMemoryAccountRepository();
    movementRepo = new InMemoryMovementRepository();
    useCase = new RecordMovementUseCase(accountRepo, movementRepo);

    // Semilla: Cuenta Clase 1 y Grupo 11
    await accountRepo.save(Account.create({ code: '1', name: 'ACTIVO', nature: AccountNature.DEBITO }));
    await accountRepo.save(Account.create({ code: '11', name: 'DISPONIBLE', nature: AccountNature.DEBITO }));
  });

  it('debe registrar un movimiento contable en una cuenta sin hijas (hoja)', async () => {
    const result = await useCase.execute({
      accountCode: '11',
      concept: 'Consignación bancaria',
      debit: 100000,
      credit: 0,
    });

    expect(result.id).toBeDefined();
    expect(result.accountCode).toBe('11');
    expect(result.concept).toBe('Consignación bancaria');
    expect(result.debit).toBe(100000);
    expect(result.credit).toBe(0);
  });

  it('debe rechazar el movimiento si la cuenta contiene cuentas hijas', async () => {
    // La Clase '1' tiene una hija '11'
    await expect(
      useCase.execute({
        accountCode: '1',
        concept: 'Intento en cuenta padre',
        debit: 50000,
      }),
    ).rejects.toThrow(AccountDoesNotAcceptMovementsException);
  });

  it('debe rechazar el movimiento si la cuenta no existe', async () => {
    await expect(
      useCase.execute({
        accountCode: '999999',
        concept: 'Cuenta inexistente',
      }),
    ).rejects.toThrow(AccountNotFoundException);
  });
});

