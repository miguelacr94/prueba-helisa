import { beforeEach, describe, expect, it } from 'vitest';
import { CreateAccountUseCase } from './create-account.use-case.js';
import { GetAccountTreeUseCase } from './get-account-tree.use-case.js';
import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/in-memory-account.repository.js';
import { AccountNature } from '../../domain/enums/account-nature.enum.js';

describe('GetAccountTreeUseCase', () => {
  let repository: InMemoryAccountRepository;
  let createUseCase: CreateAccountUseCase;
  let treeUseCase: GetAccountTreeUseCase;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    createUseCase = new CreateAccountUseCase(repository);
    treeUseCase = new GetAccountTreeUseCase(repository);
  });

  it('debe retornar un arreglo vacío si no hay cuentas', async () => {
    const tree = await treeUseCase.execute();
    expect(tree).toEqual([]);
  });

  it('debe armar la jerarquía completa en forma de árbol', async () => {
    await createUseCase.execute({ code: '1', name: 'ACTIVO', nature: AccountNature.DEBITO });
    await createUseCase.execute({ code: '11', name: 'DISPONIBLE' });
    await createUseCase.execute({ code: '1105', name: 'CAJA' });
    await createUseCase.execute({ code: '110505', name: 'CAJA GENERAL' });
    await createUseCase.execute({ code: '2', name: 'PASIVO', nature: AccountNature.CREDITO });

    const tree = await treeUseCase.execute();

    expect(tree).toHaveLength(2); // Dos clases raíz (1 y 2)

    const activo = tree.find((n) => n.code === '1');
    expect(activo).toBeDefined();
    expect(activo?.children).toHaveLength(1);
    expect(activo?.children[0].code).toBe('11');

    const caja = activo?.children[0].children[0];
    expect(caja?.code).toBe('1105');
    expect(caja?.children).toHaveLength(1);

    const cajaGeneral = caja?.children[0];
    expect(cajaGeneral?.code).toBe('110505');
    expect(cajaGeneral?.children).toHaveLength(0);
    expect(cajaGeneral?.acceptsMovements).toBe(true);

    const pasivo = tree.find((n) => n.code === '2');
    expect(pasivo).toBeDefined();
    expect(pasivo?.children).toHaveLength(0);
  });
});

