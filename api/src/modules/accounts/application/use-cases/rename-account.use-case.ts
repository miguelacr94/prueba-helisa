import { Inject, Injectable } from '@nestjs/common';
import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port.js';
import { ACCOUNT_REPOSITORY_TOKEN } from '../../accounts.tokens.js';
import { AccountNotFoundException } from '../../domain/exceptions/account-domain.exception.js';
import { AccountOutputDto, toAccountOutputDto } from '../dtos/account-output.dto.js';
import { RenameAccountCommand } from '../dtos/rename-account.command.js';

@Injectable()
export class RenameAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly repository: AccountRepositoryPort,
  ) {}

  async execute(command: RenameAccountCommand): Promise<AccountOutputDto> {
    const trimmedCode = command.code.trim();
    const account = await this.repository.findByCode(trimmedCode);

    if (!account) {
      throw new AccountNotFoundException(trimmedCode);
    }

    account.updateName(command.newName);
    await this.repository.save(account);

    return toAccountOutputDto(account);
  }
}

