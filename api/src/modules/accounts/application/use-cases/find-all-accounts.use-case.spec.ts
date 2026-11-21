import { beforeEach, describe, expect, it } from 'vitest';
import { FindAllAccountsUseCase } from './find-all-accounts.use-case.js';
import { InMemoryAccountRepository } from '../../infrastructure/persistence/in-memory/in-memory-account.repository.js';
import { Account } from '../../domain/entities/account.entity.js';
import { AccountNature } from '../../domain/enums/account-nature.enum.js';

describe('FindAllAccountsUseCase', () => {
  let repository: InMemoryAccountRepository;
  let useCase: FindAllAccountsUseCase;

  beforeEach(async () => {
    repository = new InMemoryAccountRepository();
    useCase = new FindAllAccountsUseCase(repository);

    await repository.save(Account.create({ code: '1', name: 'ACTIVO', nature: AccountNature.DEBITO }));
    await repository.save(Account.create({ code: '11', name: 'DISPONIBLE', nature: AccountNature.DEBITO }));
    await repository.save(Account.create({ code: '1105', name: 'CAJA', nature: AccountNature.DEBITO }));
    await repository.save(Account.create({ code: '2', name: 'PASIVO', nature: AccountNature.CREDITO }));
  });

  it('debe retornar todas las cuentas cuando no se envía término de búsqueda', async () => {
    const results = await useCase.execute();
    expect(results).toHaveLength(4);
  });

  it('debe filtrar cuentas por coincidencia en el código', async () => {
    const results = await useCase.execute('1105');
    expect(results).toHaveLength(1);
    expect(results[0].code).toBe('1105');
    expect(results[0].name).toBe('CAJA');
  });

  it('debe filtrar cuentas por coincidencia en el nombre (case-insensitive)', async () => {
    const results = await useCase.execute('dispon');
    expect(results).toHaveLength(1);
    expect(results[0].code).toBe('11');
    expect(results[0].name).toBe('DISPONIBLE');
  });

  it('debe retornar un arreglo vacío si ningún código o nombre coincide', async () => {
    const results = await useCase.execute('inexistente');
    expect(results).toHaveLength(0);
  });
});

