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

  async execute(): Promise<AccountOutputDto[]> {
    const accounts = await this.repository.findAll();
    return accounts.map(toAccountOutputDto);
  }
}
