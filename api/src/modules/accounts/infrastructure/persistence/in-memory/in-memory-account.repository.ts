import { Injectable } from '@nestjs/common';
import { Account } from '../../../domain/entities/account.entity.js';
import { AccountRepositoryPort } from '../../../domain/ports/account.repository.port.js';

@Injectable()
export class InMemoryAccountRepository implements AccountRepositoryPort {
  private readonly accounts = new Map<string, Account>();

  async save(account: Account): Promise<void> {
    this.accounts.set(account.code, account);
  }

  async findByCode(code: string): Promise<Account | null> {
    const acc = this.accounts.get(code);
    return acc ?? null;
  }

  async findAll(): Promise<Account[]> {
    return Array.from(this.accounts.values()).sort((a, b) => a.code.localeCompare(b.code));
  }

  async delete(code: string): Promise<void> {
    this.accounts.delete(code);
  }

  async hasChildren(parentCode: string): Promise<boolean> {
    for (const [, acc] of this.accounts.entries()) {
      if (acc.getExpectedParentCode() === parentCode) {
        return true;
      }
    }
    return false;
  }

  async findChildren(parentCode: string): Promise<Account[]> {
    const children: Account[] = [];
    for (const [, acc] of this.accounts.entries()) {
      if (acc.getExpectedParentCode() === parentCode) {
        children.push(acc);
      }
    }
    return children.sort((a, b) => a.code.localeCompare(b.code));
  }

  async count(): Promise<number> {
    return this.accounts.size;
  }
}

