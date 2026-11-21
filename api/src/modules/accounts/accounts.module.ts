import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ACCOUNT_REPOSITORY_TOKEN,
  ACCOUNTING_MOVEMENT_REPOSITORY_TOKEN,
} from './accounts.tokens.js';
import { AccountOrmEntity } from './infrastructure/persistence/sqlite/entities/account.orm-entity.js';
import { AccountingMovementOrmEntity } from './infrastructure/persistence/sqlite/entities/accounting-movement.orm-entity.js';
import { SqliteAccountRepository } from './infrastructure/persistence/sqlite/repositories/sqlite-account.repository.js';
import { SqliteMovementRepository } from './infrastructure/persistence/sqlite/repositories/sqlite-movement.repository.js';
import { CreateAccountUseCase } from './application/use-cases/create-account.use-case.js';
import { FindAllAccountsUseCase } from './application/use-cases/find-all-accounts.use-case.js';
import { FindAccountByCodeUseCase } from './application/use-cases/find-account-by-code.use-case.js';
import { GetAccountTreeUseCase } from './application/use-cases/get-account-tree.use-case.js';
import { DeleteAccountUseCase } from './application/use-cases/delete-account.use-case.js';
import { RenameAccountUseCase } from './application/use-cases/rename-account.use-case.js';
import { RecordMovementUseCase } from './application/use-cases/record-movement.use-case.js';
import { FindMovementsByAccountUseCase } from './application/use-cases/find-movements-by-account.use-case.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountOrmEntity, AccountingMovementOrmEntity]),
  ],
  providers: [
    {
      provide: ACCOUNT_REPOSITORY_TOKEN,
      useClass: SqliteAccountRepository,
    },
    {
      provide: ACCOUNTING_MOVEMENT_REPOSITORY_TOKEN,
      useClass: SqliteMovementRepository,
    },
    CreateAccountUseCase,
    FindAllAccountsUseCase,
    FindAccountByCodeUseCase,
    GetAccountTreeUseCase,
    DeleteAccountUseCase,
    RenameAccountUseCase,
    RecordMovementUseCase,
    FindMovementsByAccountUseCase,
  ],
  exports: [
    CreateAccountUseCase,
    FindAllAccountsUseCase,
    FindAccountByCodeUseCase,
    GetAccountTreeUseCase,
    DeleteAccountUseCase,
    RenameAccountUseCase,
    RecordMovementUseCase,
    FindMovementsByAccountUseCase,
    ACCOUNT_REPOSITORY_TOKEN,
    ACCOUNTING_MOVEMENT_REPOSITORY_TOKEN,
  ],
})
export class AccountsModule {}

