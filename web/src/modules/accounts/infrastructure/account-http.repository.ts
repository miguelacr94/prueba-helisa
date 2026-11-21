import { httpClient, HttpClient } from '../../../shared/api/http-client';
import type { Account, AccountTreeNode, CreateAccountInput } from '../domain/models/account.model';
import type { IAccountRepository } from '../domain/repositories/account.repository.interface';

export class AccountHttpRepository implements IAccountRepository {
  private readonly client: HttpClient;

  constructor(client: HttpClient = httpClient) {
    this.client = client;
  }

  async getTree(): Promise<AccountTreeNode[]> {
    return this.client.get<AccountTreeNode[]>('/accounts/tree');
  }

  async getAll(): Promise<Account[]> {
    return this.client.get<Account[]>('/accounts');
  }

  async getByCode(code: string): Promise<Account> {
    return this.client.get<Account>(`/accounts/${code}`);
  }

  async create(payload: CreateAccountInput): Promise<Account> {
    return this.client.post<Account>('/accounts', payload);
  }

  async rename(code: string, newName: string): Promise<Account> {
    return this.client.patch<Account>(`/accounts/${code}`, { name: newName });
  }

  async delete(code: string): Promise<{ message: string }> {
    return this.client.delete<{ message: string }>(`/accounts/${code}`);
  }
}

export const accountRepository: IAccountRepository = new AccountHttpRepository();
