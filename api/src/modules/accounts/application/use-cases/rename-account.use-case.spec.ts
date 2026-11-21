import { beforeEach, describe, expect, it } from 'vitest';
import { CreateAccountUseCase } from './create-account.use-case.js';
import { RenameAccountUseCase } from './rename-account.use-case.js';
import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/in-memory-account.repository.js';
import { AccountNature } from '../../domain/enums/account-nature.enum.js';
import {
  AccountNotFoundException,
  InvalidAccountNameException,
} from '../../domain/exceptions/account-domain.exception.js';

describe('RenameAccountUseCase', () => {
  let repository: InMemoryAccountRepository;
  let createUseCase: CreateAccountUseCase;
  let renameUseCase: RenameAccountUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    createUseCase = new CreateAccountUseCase(repository);
    renameUseCase = new RenameAccountUseCase(repository);
  });

  it('debe renombrar una cuenta existente exitosamente', async () => {
    await createUseCase.execute({
      code: '1',
      name: 'ACTIVO',
      nature: AccountNature.DEBITO,
    });

    const updated = await renameUseCase.execute({
      code: '1',
      newName: 'ACTIVOS TOTALES',
    });

    expect(updated.name).toBe('ACTIVOS TOTALES');

    const inRepo = await repository.findByCode('1');
    expect(inRepo?.name).toBe('ACTIVOS TOTALES');
  });

  it('debe fallar si la cuenta no existe', async () => {
    await expect(
      renameUseCase.execute({
        code: '99',
        newName: 'CUENTA INEXISTENTE',
      }),
    ).rejects.toThrow(AccountNotFoundException);
  });

  it('debe fallar si el nuevo nombre está vacío', async () => {
    await createUseCase.execute({
      code: '1',
      name: 'ACTIVO',
      nature: AccountNature.DEBITO,
    });

    await expect(
      renameUseCase.execute({
        code: '1',
        newName: '   ',
      }),
    ).rejects.toThrow(InvalidAccountNameException);
  });
});
