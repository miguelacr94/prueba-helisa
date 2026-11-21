import { Inject, Injectable } from '@nestjs/common';
import { Account } from '../../domain/entities/account.entity.js';
import { AccountLevel } from '../../domain/enums/account-level.enum.js';
import {
  AccountAlreadyExistsException,
  InvalidAccountNatureException,
  ParentAccountNotFoundException,
} from '../../domain/exceptions/account-domain.exception.js';
import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port.js';
import { ACCOUNT_REPOSITORY_TOKEN } from '../../accounts.tokens.js';
import { CreateAccountCommand } from '../dtos/create-account.command.js';
import { AccountOutputDto, toAccountOutputDto } from '../dtos/account-output.dto.js';

@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly repository: AccountRepositoryPort,
  ) {}

  async execute(command: CreateAccountCommand): Promise<AccountOutputDto> {
    const trimmedCode = command.code?.trim();
    const existing = await this.repository.findByCode(trimmedCode);
    if (existing) {
      throw new AccountAlreadyExistsException(trimmedCode);
    }

    const level = Account.calculateLevel(trimmedCode);
    let resolvedNature = command.nature;

    if (level === AccountLevel.CLASE) {
      if (!command.nature) {
        throw new InvalidAccountNatureException(
          'Para cuentas de nivel Clase (1 dígito) es obligatorio especificar la naturaleza contable (DEBITO o CREDITO).',
        );
      }
      resolvedNature = command.nature;
    } else {
      // Determinar código del padre esperado
      const expectedParentCode = Account.getExpectedParentCode(trimmedCode);

      if (!expectedParentCode) {
        throw new ParentAccountNotFoundException('desconocido');
      }

      const parent = await this.repository.findByCode(expectedParentCode);
      if (!parent) {
        throw new ParentAccountNotFoundException(expectedParentCode);
      }

      // Regla de Negocio: Los descendientes heredan la naturaleza de su padre/ancestro
      resolvedNature = parent.nature;

      // Si el padre no tenía hijas, ahora pasa a tenerlas (deja de admitir movimientos contables)
      if (!parent.hasChildren) {
        parent.setHasChildren(true);
        await this.repository.save(parent);
      }
    }

    const newAccount = Account.create({
      code: trimmedCode,
      name: command.name,
      nature: resolvedNature!,
      hasChildren: false,
    });

    await this.repository.save(newAccount);

    return toAccountOutputDto(newAccount);
  }
}
