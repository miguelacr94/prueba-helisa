import { Module } from '@nestjs/common';
import { ACCOUNT_REPOSITORY_TOKEN } from './accounts.tokens.js';
import { InMemoryAccountRepository } from './infrastructure/persistence/in-memory/in-memory-account.repository.js';
import { CreateAccountUseCase } from './application/use-cases/create-account.use-case.js';
import { FindAllAccountsUseCase } from './application/use-cases/find-all-accounts.use-case.js';
import { FindAccountByCodeUseCase } from './application/use-cases/find-account-by-code.use-case.js';
import { GetAccountTreeUseCase } from './application/use-cases/get-account-tree.use-case.js';
import { DeleteAccountUseCase } from './application/use-cases/delete-account.use-case.js';

@Module({
  providers: [
    {
      provide: ACCOUNT_REPOSITORY_TOKEN,
      useClass: InMemoryAccountRepository,
    },
    CreateAccountUseCase,
    FindAllAccountsUseCase,
    FindAccountByCodeUseCase,
    GetAccountTreeUseCase,
    DeleteAccountUseCase,
  ],
  exports: [
    CreateAccountUseCase,
    FindAllAccountsUseCase,
    FindAccountByCodeUseCase,
    GetAccountTreeUseCase,
    DeleteAccountUseCase,
    ACCOUNT_REPOSITORY_TOKEN,
  ],
})
export class AccountsModule {}

