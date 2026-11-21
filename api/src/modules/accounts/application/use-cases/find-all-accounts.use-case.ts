import { Inject, Injectable } from '@nestjs/common';
import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port.js';
import { ACCOUNT_REPOSITORY_TOKEN } from '../../accounts.tokens.js';
import { AccountOutputDto, toAccountOutputDto } from '../dtos/account-output.dto.js';

@Injectable()
export class FindAllAccountsUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly repository: AccountRepositoryPort,
  ) {}

  async execute(search?: string): Promise<AccountOutputDto[]> {
    const accounts = await this.repository.findAll();
    const query = search?.trim().toLowerCase();

    const filtered = query
      ? accounts.filter(
          (acc) =>
            acc.code.toLowerCase().includes(query) ||
            acc.name.toLowerCase().includes(query),
        )
      : accounts;

    return filtered.map(toAccountOutputDto);
  }
}
