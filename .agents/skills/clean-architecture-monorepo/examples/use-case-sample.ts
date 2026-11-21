import { Inject, Injectable } from '@nestjs/common';
import { Account, AccountNature, DomainException } from './account-entity-sample';
import { AccountRepositoryPort } from './port-and-adapter-sample';

export const ACCOUNT_REPOSITORY_TOKEN = Symbol('ACCOUNT_REPOSITORY_TOKEN');

export class AccountAlreadyExistsException extends DomainException {
  constructor(code: string) {
    super(`Ya existe una cuenta registrada con el código ${code}.`);
  }
}

export class ParentAccountNotFoundException extends DomainException {
  constructor(parentCode: string) {
    super(`No se puede crear la cuenta porque su cuenta padre (${parentCode}) no existe.`);
  }
}

export interface CreateAccountCommand {
  code: string;
  name: string;
  nature?: AccountNature; // Solo obligatorio para nivel CLASE (1 dígito)
}

/**
 * CASO DE USO: Crear Cuenta (Single Responsibility Principle)
 * Solo orquesta las reglas de creación: unicidad, existencia del padre, herencia de naturaleza y persistencia.
 */
@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly repository: AccountRepositoryPort,
  ) {}

  async execute(command: CreateAccountCommand): Promise<Account> {
    const existing = await this.repository.findByCode(command.code);
    if (existing) {
      throw new AccountAlreadyExistsException(command.code);
    }

    // Instanciación temporal para calcular nivel y padre esperado
    const tempLevel = Account.calculateLevel(command.code);
    let resolvedNature: AccountNature;

    if (tempLevel === 'CLASE') {
      if (!command.nature) {
        throw new DomainException('Para una cuenta de nivel Clase (1 dígito) es obligatorio especificar la naturaleza.');
      }
      resolvedNature = command.nature;
    } else {
      // Obtener el código padre esperado
      const dummyAccount = Account.create({
        code: command.code,
        name: command.name,
        nature: AccountNature.DEBITO, // Temporal para calcular padre
      });
      const expectedParentCode = dummyAccount.getExpectedParentCode();

      if (!expectedParentCode) {
        throw new DomainException(`No se pudo determinar el padre para el código ${command.code}`);
      }

      const parent = await this.repository.findByCode(expectedParentCode);
      if (!parent) {
        throw new ParentAccountNotFoundException(expectedParentCode);
      }

      // Regla: Los descendientes heredan la naturaleza del padre
      resolvedNature = parent.nature;

      // Al padre ahora se le marca que tiene hijas (deja de ser cuenta de movimiento)
      if (!parent.hasChildren) {
        parent.setHasChildren(true);
        await this.repository.save(parent);
      }
    }

    const newAccount = Account.create({
      code: command.code,
      name: command.name,
      nature: resolvedNature,
      hasChildren: false,
    });

    await this.repository.save(newAccount);
    return newAccount;
  }
}

