import { beforeEach, describe, expect, it } from 'vitest';
import { CreateAccountUseCase } from './create-account.use-case.js';
import { DeleteAccountUseCase } from './delete-account.use-case.js';
import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/in-memory-account.repository.js';
import { AccountNature } from '../../domain/enums/account-nature.enum.js';
import {
  AccountHasChildrenException,
  AccountNotFoundException,
} from '../../domain/exceptions/account-domain.exception.js';

describe('DeleteAccountUseCase', () => {
  let repository: InMemoryAccountRepository;
  let createUseCase: CreateAccountUseCase;
  let deleteUseCase: DeleteAccountUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    createUseCase = new CreateAccountUseCase(repository);
    deleteUseCase = new DeleteAccountUseCase(repository);
  });

  it('debe fallar al intentar eliminar una cuenta que no existe', async () => {
    await expect(deleteUseCase.execute('99')).rejects.toThrow(AccountNotFoundException);
  });

  it('no se puede eliminar una cuenta que tenga cuentas hijas', async () => {
    await createUseCase.execute({ code: '1', name: 'ACTIVO', nature: AccountNature.DEBITO });
    await createUseCase.execute({ code: '11', name: 'DISPONIBLE' });

    await expect(deleteUseCase.execute('1')).rejects.toThrow(AccountHasChildrenException);
  });

  it('debe eliminar exitosamente una cuenta hoja y actualizar el estado de su padre', async () => {
    await createUseCase.execute({ code: '1', name: 'ACTIVO', nature: AccountNature.DEBITO });
    await createUseCase.execute({ code: '11', name: 'DISPONIBLE' });

    // El padre (1) tiene hijas
    const parentBefore = await repository.findByCode('1');
    expect(parentBefore?.hasChildren).toBe(true);
    expect(parentBefore?.acceptsMovements()).toBe(false);

    // Eliminamos la única hija (11)
    await deleteUseCase.execute('11');

    const deleted = await repository.findByCode('11');
    expect(deleted).toBeNull();

    // El padre (1) ahora no tiene hijas y vuelve a admitir movimientos
    const parentAfter = await repository.findByCode('1');
    expect(parentAfter?.hasChildren).toBe(false);
    expect(parentAfter?.acceptsMovements()).toBe(true);
  });
});

