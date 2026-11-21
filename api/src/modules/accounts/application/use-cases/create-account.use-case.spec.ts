import { beforeEach, describe, expect, it } from 'vitest';
import { CreateAccountUseCase } from './create-account.use-case.js';
import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/in-memory-account.repository.js';
import { AccountNature } from '../../domain/enums/account-nature.enum.js';
import { AccountLevel } from '../../domain/enums/account-level.enum.js';
import {
  AccountAlreadyExistsException,
  InvalidAccountNatureException,
  ParentAccountNotFoundException,
} from '../../domain/exceptions/account-domain.exception.js';

describe('CreateAccountUseCase', () => {
  let repository: InMemoryAccountRepository;
  let useCase: CreateAccountUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    useCase = new CreateAccountUseCase(repository);
  });

  it('debe crear una Clase exitosamente cuando se proporciona la naturaleza', async () => {
    const result = await useCase.execute({
      code: '1',
      name: 'ACTIVO',
      nature: AccountNature.DEBITO,
    });

    expect(result.code).toBe('1');
    expect(result.name).toBe('ACTIVO');
    expect(result.level).toBe(AccountLevel.CLASE);
    expect(result.nature).toBe(AccountNature.DEBITO);
    expect(result.parentCode).toBeNull();
    expect(result.acceptsMovements).toBe(true);
  });

  it('debe fallar al crear una Clase si no se proporciona la naturaleza', async () => {
    await expect(
      useCase.execute({
        code: '1',
        name: 'ACTIVO',
      }),
    ).rejects.toThrow(InvalidAccountNatureException);
  });

  it('debe fallar si el padre no existe', async () => {
    await expect(
      useCase.execute({
        code: '11',
        name: 'DISPONIBLE',
      }),
    ).rejects.toThrow(ParentAccountNotFoundException);
  });

  it('debe heredar la naturaleza del padre y actualizar hasChildren del padre', async () => {
    // 1. Crear Clase (Activo, Débito)
    await useCase.execute({
      code: '1',
      name: 'ACTIVO',
      nature: AccountNature.DEBITO,
    });

    // 2. Crear Grupo (11). No se pasa naturaleza, debe heredar DEBITO
    const grupo = await useCase.execute({
      code: '11',
      name: 'DISPONIBLE',
    });

    expect(grupo.code).toBe('11');
    expect(grupo.nature).toBe(AccountNature.DEBITO);
    expect(grupo.parentCode).toBe('1');

    // Verificar que el padre (1) ahora tiene hijas y no admite movimientos
    const parentAccount = await repository.findByCode('1');
    expect(parentAccount?.hasChildren).toBe(true);
    expect(parentAccount?.acceptsMovements()).toBe(false);

    // 3. Crear Cuenta (1105)
    const cuenta = await useCase.execute({
      code: '1105',
      name: 'CAJA',
    });
    expect(cuenta.nature).toBe(AccountNature.DEBITO);
    expect(cuenta.parentCode).toBe('11');

    // 4. Crear Subcuenta (110505)
    const subcuenta = await useCase.execute({
      code: '110505',
      name: 'CAJA GENERAL',
    });
    expect(subcuenta.nature).toBe(AccountNature.DEBITO);
    expect(subcuenta.parentCode).toBe('1105');
    expect(subcuenta.acceptsMovements).toBe(true);
  });

  it('debe rechazar la creación si el código ya existe', async () => {
    await useCase.execute({
      code: '1',
      name: 'ACTIVO',
      nature: AccountNature.DEBITO,
    });

    await expect(
      useCase.execute({
        code: '1',
        name: 'OTRO ACTIVO',
        nature: AccountNature.DEBITO,
      }),
    ).rejects.toThrow(AccountAlreadyExistsException);
  });
});

