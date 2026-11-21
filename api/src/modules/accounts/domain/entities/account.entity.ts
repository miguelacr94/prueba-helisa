import { AccountLevel } from '../enums/account-level.enum.js';
import { AccountNature } from '../enums/account-nature.enum.js';
import {
  InvalidAccountCodeException,
  InvalidAccountNameException,
  InvalidAccountNatureException,
} from '../exceptions/account-domain.exception.js';

export interface AccountProps {
  code: string;
  name: string;
  nature: AccountNature;
  hasChildren?: boolean;
}

export class Account {
  private readonly _code: string;
  private _name: string;
  private readonly _nature: AccountNature;
  private readonly _level: AccountLevel;
  private _hasChildren: boolean;

  private constructor(props: AccountProps) {
    this.validate(props);
    this._code = props.code.trim();
    this._name = props.name.trim();
    this._nature = props.nature;
    this._level = Account.calculateLevel(this._code);
    this._hasChildren = props.hasChildren ?? false;
  }

  public static create(props: AccountProps): Account {
    return new Account(props);
  }

  public static reconstruct(props: AccountProps & { level?: AccountLevel }): Account {
    return new Account(props);
  }

  private validate(props: AccountProps): void {
    if (!props.code || !/^\d+$/.test(props.code.trim())) {
      throw new InvalidAccountCodeException(
        `El código de la cuenta debe ser estrictamente numérico. Recibido: "${props.code}"`,
      );
    }

    const trimmedCode = props.code.trim();
    const len = trimmedCode.length;
    if (![1, 2, 4, 6].includes(len)) {
      throw new InvalidAccountCodeException(
        `Longitud de código inválida (${len}). Solo se admiten longitudes de 1 (Clase), 2 (Grupo), 4 (Cuenta) o 6 (Subcuenta).`,
      );
    }

    if (!props.name || props.name.trim().length === 0) {
      throw new InvalidAccountNameException('El nombre de la cuenta es obligatorio y no puede estar vacío.');
    }

    if (!Object.values(AccountNature).includes(props.nature)) {
      throw new InvalidAccountNatureException(
        `Naturaleza contable inválida: "${props.nature}". Debe ser DEBITO o CREDITO.`,
      );
    }
  }

  public static calculateLevel(code: string): AccountLevel {
    const len = code.trim().length;
    switch (len) {
      case 1:
        return AccountLevel.CLASE;
      case 2:
        return AccountLevel.GRUPO;
      case 4:
        return AccountLevel.CUENTA;
      case 6:
        return AccountLevel.SUBCUENTA;
      default:
        throw new InvalidAccountCodeException(`No existe un nivel contable para un código de longitud ${len}.`);
    }
  }

  /**
   * Obtiene el código del padre esperado según la longitud y jerarquía:
   * 6 dígitos (Subcuenta) -> prefijo de 4 dígitos (Cuenta)
   * 4 dígitos (Cuenta)    -> prefijo de 2 dígitos (Grupo)
   * 2 dígitos (Grupo)     -> prefijo de 1 dígito (Clase)
   * 1 dígito  (Clase)     -> null (las Clases no tienen padre)
   */
  public static getExpectedParentCode(code: string): string | null {
    const trimmed = code.trim();
    switch (trimmed.length) {
      case 6:
        return trimmed.substring(0, 4);
      case 4:
        return trimmed.substring(0, 2);
      case 2:
        return trimmed.substring(0, 1);
      case 1:
        return null;
      default:
        return null;
    }
  }

  public getExpectedParentCode(): string | null {
    return Account.getExpectedParentCode(this._code);
  }

  /**
   * Regla de Negocio: Solo las cuentas sin hijas admiten movimientos contables
   */
  public acceptsMovements(): boolean {
    return !this._hasChildren;
  }

  public setHasChildren(hasChildren: boolean): void {
    this._hasChildren = hasChildren;
  }

  public updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new InvalidAccountNameException('El nombre de la cuenta no puede estar vacío.');
    }
    this._name = newName.trim();
  }

  // Getters
  public get code(): string {
    return this._code;
  }

  public get name(): string {
    return this._name;
  }

  public get nature(): AccountNature {
    return this._nature;
  }

  public get level(): AccountLevel {
    return this._level;
  }

  public get hasChildren(): boolean {
    return this._hasChildren;
  }
}
