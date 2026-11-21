import type { Account, AccountTreeNode, CreateAccountInput } from '../models/account.model';

export interface IAccountRepository {
  getTree(): Promise<AccountTreeNode[]>;
  getAll(): Promise<Account[]>;
  getByCode(code: string): Promise<Account>;
  create(payload: CreateAccountInput): Promise<Account>;
  rename(code: string, newName: string): Promise<Account>;
  delete(code: string): Promise<{ message: string }>;
}
