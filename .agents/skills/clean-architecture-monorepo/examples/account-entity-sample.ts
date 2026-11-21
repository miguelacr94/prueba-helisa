export enum AccountLevel {
  CLASE = 'CLASE',
  GRUPO = 'GRUPO',
  CUENTA = 'CUENTA',
  SUBCUENTA = 'SUBCUENTA',
}

export enum AccountNature {
  DEBITO = 'DEBITO',
  CREDITO = 'CREDITO',
}

export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidAccountCodeException extends DomainException {}
export class InvalidAccountNameException extends DomainException {}
export class InvalidAccountNatureException extends DomainException {}

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

  /**
   * Factory method para crear una nueva cuenta garantizando sus invariantes
   */
  public static create(props: AccountProps): Account {
    return new Account(props);
  }

  public static reconstruct(props: AccountProps & { level?: AccountLevel }): Account {
    return new Account(props);
  }

  private validate(props: AccountProps): void {
    if (!props.code || !/^\d+$/.test(props.code)) {
      throw new InvalidAccountCodeException(`El código debe ser puramente numérico. Recibido: ${props.code}`);
    }

    const len = props.code.length;
    if (![1, 2, 4, 6].includes(len)) {
      throw new InvalidAccountCodeException(
        `Longitud de código inválida (${len}). Solo se permiten longitudes de 1 (Clase), 2 (Grupo), 4 (Cuenta) o 6 (Subcuenta).`,
      );
    }

    if (!props.name || props.name.trim().length === 0) {
      throw new InvalidAccountNameException('El nombre de la cuenta no puede estar vacío.');
    }

    if (!Object.values(AccountNature).includes(props.nature)) {
      throw new InvalidAccountNatureException(`Naturaleza inválida: ${props.nature}`);
    }
  }

  public static calculateLevel(code: string): AccountLevel {
    switch (code.length) {
      case 1:
        return AccountLevel.CLASE;
      case 2:
        return AccountLevel.GRUPO;
      case 4:
        return AccountLevel.CUENTA;
      case 6:
        return AccountLevel.SUBCUENTA;
      default:
        throw new InvalidAccountCodeException(`Longitud desconocida para determinar nivel: ${code.length}`);
    }
  }

  /**
   * Retorna el código del padre esperado según la longitud del código actual.
   * Si es Clase (1 dígito), retorna null porque no tiene padre.
   */
  public getExpectedParentCode(): string | null {
    switch (this._code.length) {
      case 6:
        return this._code.substring(0, 4);
      case 4:
        return this._code.substring(0, 2);
      case 2:
        return this._code.substring(0, 1);
      case 1:
        return null;
      default:
        return null;
    }
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
      throw new InvalidAccountNameException('El nombre no puede estar vacío.');
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

