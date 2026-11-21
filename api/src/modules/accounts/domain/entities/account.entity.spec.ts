import { describe, expect, it } from 'vitest';
import { Account } from './account.entity.js';
import { AccountLevel } from '../enums/account-level.enum.js';
import { AccountNature } from '../enums/account-nature.enum.js';
import {
  InvalidAccountCodeException,
  InvalidAccountNameException,
  InvalidAccountNatureException,
} from '../exceptions/account-domain.exception.js';

describe('Account Entity (Domain Invariants)', () => {
  describe('Validations', () => {
    it('debe crear exitosamente una cuenta de nivel Clase (1 dígito)', () => {
      const account = Account.create({
        code: '1',
        name: 'ACTIVO',
        nature: AccountNature.DEBITO,
      });

      expect(account.code).toBe('1');
      expect(account.name).toBe('ACTIVO');
      expect(account.level).toBe(AccountLevel.CLASE);
      expect(account.nature).toBe(AccountNature.DEBITO);
      expect(account.getExpectedParentCode()).toBeNull();
      expect(account.acceptsMovements()).toBe(true);
    });

    it('debe rechazar códigos con longitudes no permitidas (3, 5, 7 dígitos)', () => {
      expect(() =>
        Account.create({ code: '110', name: 'Invalido', nature: AccountNature.DEBITO }),
      ).toThrow(InvalidAccountCodeException);

      expect(() =>
        Account.create({ code: '11050', name: 'Invalido', nature: AccountNature.DEBITO }),
      ).toThrow(InvalidAccountCodeException);
    });

    it('debe rechazar códigos con caracteres no numéricos', () => {
      expect(() =>
        Account.create({ code: '1A', name: 'Invalido', nature: AccountNature.DEBITO }),
      ).toThrow(InvalidAccountCodeException);

      expect(() =>
        Account.create({ code: '11-05', name: 'Invalido', nature: AccountNature.DEBITO }),
      ).toThrow(InvalidAccountCodeException);
    });

    it('debe rechazar nombres vacíos o solo espacios', () => {
      expect(() =>
        Account.create({ code: '1', name: '   ', nature: AccountNature.DEBITO }),
      ).toThrow(InvalidAccountNameException);
    });

    it('debe rechazar una naturaleza contable inexistente', () => {
      expect(() =>
        Account.create({ code: '1', name: 'Caja', nature: 'OTRA' as unknown as AccountNature }),
      ).toThrow(InvalidAccountNatureException);
    });
  });

  describe('Cálculo de Niveles y Padres', () => {
    it('debe calcular el nivel y padre correcto para cada longitud', () => {
      const clase = Account.create({ code: '1', name: 'Activo', nature: AccountNature.DEBITO });
      expect(clase.level).toBe(AccountLevel.CLASE);
      expect(clase.getExpectedParentCode()).toBeNull();

      const grupo = Account.create({ code: '11', name: 'Disponible', nature: AccountNature.DEBITO });
      expect(grupo.level).toBe(AccountLevel.GRUPO);
      expect(grupo.getExpectedParentCode()).toBe('1');

      const cuenta = Account.create({ code: '1105', name: 'Caja', nature: AccountNature.DEBITO });
      expect(cuenta.level).toBe(AccountLevel.CUENTA);
      expect(cuenta.getExpectedParentCode()).toBe('11');

      const subcuenta = Account.create({ code: '110505', name: 'Caja General', nature: AccountNature.DEBITO });
      expect(subcuenta.level).toBe(AccountLevel.SUBCUENTA);
      expect(subcuenta.getExpectedParentCode()).toBe('1105');
    });
  });

  describe('Regla de Movimientos Contables', () => {
    it('solo las cuentas sin hijas admiten movimientos contables', () => {
      const cuenta = Account.create({ code: '110505', name: 'Caja General', nature: AccountNature.DEBITO });
      expect(cuenta.acceptsMovements()).toBe(true);

      cuenta.setHasChildren(true);
      expect(cuenta.acceptsMovements()).toBe(false);

      cuenta.setHasChildren(false);
      expect(cuenta.acceptsMovements()).toBe(true);
    });
  });
});

