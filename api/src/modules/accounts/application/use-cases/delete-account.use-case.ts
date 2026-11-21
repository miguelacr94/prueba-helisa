import { Inject, Injectable, Optional } from '@nestjs/common';
import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port.js';
import type { AccountingMovementRepositoryPort } from '../../domain/ports/accounting-movement.repository.port.js';
import {
  ACCOUNT_REPOSITORY_TOKEN,
  ACCOUNTING_MOVEMENT_REPOSITORY_TOKEN,
} from '../../accounts.tokens.js';
import {
  AccountHasChildrenException,
  AccountHasMovementsException,
  AccountNotFoundException,
} from '../../domain/exceptions/account-domain.exception.js';

@Injectable()
export class DeleteAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly repository: AccountRepositoryPort,
    @Optional()
    @Inject(ACCOUNTING_MOVEMENT_REPOSITORY_TOKEN)
    private readonly movementRepository?: AccountingMovementRepositoryPort,
  ) {}

  async execute(code: string): Promise<void> {
    const trimmed = code.trim();
    const account = await this.repository.findByCode(trimmed);
    if (!account) {
      throw new AccountNotFoundException(trimmed);
    }

    const hasChildren = await this.repository.hasChildren(trimmed);
    if (hasChildren || account.hasChildren) {
      throw new AccountHasChildrenException(trimmed);
    }

    // Regla de integridad referencial: No eliminar cuentas con movimientos asociados
    if (this.movementRepository) {
      const hasMovements = await this.movementRepository.hasMovements(trimmed);
      if (hasMovements) {
        throw new AccountHasMovementsException(trimmed);
      }
    }

    const parentCode = account.getExpectedParentCode();

    await this.repository.delete(trimmed);

    // Si tenía padre, verificar si le quedan otras hijas
    if (parentCode) {
      const remainingChildren = await this.repository.hasChildren(parentCode);
      if (!remainingChildren) {
        const parent = await this.repository.findByCode(parentCode);
        if (parent) {
          parent.setHasChildren(false);
          await this.repository.save(parent);
        }
      }
    }
  }
}
