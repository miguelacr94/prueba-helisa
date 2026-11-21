import { beforeEach, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountsGatewayController } from './accounts-gateway.controller.js';
import { AccountsModule } from '../../modules/accounts/accounts.module.js';
import { AccountNature } from '../../modules/accounts/domain/enums/account-nature.enum.js';
import { AccountLevel } from '../../modules/accounts/domain/enums/account-level.enum.js';

describe('AccountsGatewayController (Gateway Distribution Layer)', () => {
  let controller: AccountsGatewayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AccountsModule],
      controllers: [AccountsGatewayController],
    }).compile();

    controller = module.get<AccountsGatewayController>(AccountsGatewayController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debe coordinar la creación y consulta de cuentas a través de los casos de uso', async () => {
    // 1. Crear Clase a través del Gateway Controller
    const createdClase = await controller.createAccount({
      code: '1',
      name: 'ACTIVO',
      nature: AccountNature.DEBITO,
    });

    expect(createdClase.code).toBe('1');
    expect(createdClase.level).toBe(AccountLevel.CLASE);

    // 2. Crear Grupo
    await controller.createAccount({
      code: '11',
      name: 'DISPONIBLE',
    });

    // 3. Consultar listado completo
    const list = await controller.findAll();
    expect(list).toHaveLength(2);

    // 4. Consultar por código
    const found = await controller.findByCode('11');
    expect(found.code).toBe('11');
    expect(found.parentCode).toBe('1');

    // 5. Consultar árbol
    const tree = await controller.getTree();
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);

    // 6. Eliminar grupo
    const deleteResponse = await controller.deleteAccount('11');
    expect(deleteResponse.message).toContain('eliminada exitosamente');
  });
});

