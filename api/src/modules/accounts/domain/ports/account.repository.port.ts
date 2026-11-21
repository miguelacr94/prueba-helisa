import { Account } from '../entities/account.entity.js';

export interface AccountRepositoryPort {
  save(account: Account): Promise<void>;
  findByCode(code: string): Promise<Account | null>;
  findAll(): Promise<Account[]>;
  delete(code: string): Promise<void>;
  hasChildren(parentCode: string): Promise<boolean>;
  findChildren(parentCode: string): Promise<Account[]>;
  count(): Promise<number>;
}

