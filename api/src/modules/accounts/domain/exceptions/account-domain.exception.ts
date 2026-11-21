export abstract class DomainException extends Error {
  public abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidAccountCodeException extends DomainException {
  public readonly code = 'INVALID_ACCOUNT_CODE';
}

export class InvalidAccountNameException extends DomainException {
  public readonly code = 'INVALID_ACCOUNT_NAME';
}

export class InvalidAccountNatureException extends DomainException {
  public readonly code = 'INVALID_ACCOUNT_NATURE';
}

export class AccountAlreadyExistsException extends DomainException {
  public readonly code = 'ACCOUNT_ALREADY_EXISTS';

  constructor(public readonly accountCode: string) {
    super(`Ya existe una cuenta registrada con el código ${accountCode}.`);
  }
}

export class ParentAccountNotFoundException extends DomainException {
  public readonly code = 'PARENT_ACCOUNT_NOT_FOUND';

  constructor(public readonly parentCode: string) {
    super(`No se puede crear la cuenta porque su cuenta padre (${parentCode}) no existe.`);
  }
}

export class AccountNotFoundException extends DomainException {
  public readonly code = 'ACCOUNT_NOT_FOUND';

  constructor(public readonly accountCode: string) {
    super(`La cuenta con código ${accountCode} no fue encontrada.`);
  }
}

export class AccountHasChildrenException extends DomainException {
  public readonly code = 'ACCOUNT_HAS_CHILDREN';

  constructor(public readonly accountCode: string) {
    super(`No se puede eliminar la cuenta ${accountCode} porque contiene cuentas hijas asociadas.`);
  }
}

export class AccountDoesNotAcceptMovementsException extends DomainException {
  public readonly code = 'ACCOUNT_DOES_NOT_ACCEPT_MOVEMENTS';

  constructor(public readonly accountCode: string) {
    super(`La cuenta ${accountCode} contiene cuentas hijas y no admite movimientos contables. Solo las cuentas sin hijas admiten movimientos.`);
  }
}

export class AccountHasMovementsException extends DomainException {
  public readonly code = 'ACCOUNT_HAS_MOVEMENTS';

  constructor(public readonly accountCode: string) {
    super(`No se puede eliminar la cuenta ${accountCode} porque registra movimientos contables asociados.`);
  }
}

