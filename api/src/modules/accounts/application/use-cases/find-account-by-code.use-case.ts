import { Inject, Injectable } from '@nestjs/common';
import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port.js';
import { ACCOUNT_REPOSITORY_TOKEN } from '../../accounts.tokens.js';
import { AccountNotFoundException } from '../../domain/exceptions/account-domain.exception.js';
import { AccountOutputDto, toAccountOutputDto } from '../dtos/account-output.dto.js';

@Injectable()
export class FindAccountByCodeUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly repository: AccountRepositoryPort,
  ) {}

  async execute(code: string): Promise<AccountOutputDto> {
    const trimmed = code.trim();
    const account = await this.repository.findByCode(trimmed);
    if (!account) {
      throw new AccountNotFoundException(trimmed);
    }
    return toAccountOutputDto(account);
  }
}
