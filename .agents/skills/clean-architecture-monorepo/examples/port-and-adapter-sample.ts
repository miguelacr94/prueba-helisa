import { Account } from './account-entity-sample';

/**
 * PUERTO (Domain Layer):
 * Contrato independiente de la base de datos o motor de almacenamiento.
 */
export interface AccountRepositoryPort {
  save(account: Account): Promise<void>;
  findByCode(code: string): Promise<Account | null>;
  findAll(): Promise<Account[]>;
  delete(code: string): Promise<void>;
  hasChildren(parentCode: string): Promise<boolean>;
  findChildren(parentCode: string): Promise<Account[]>;
}

/**
 * ADAPTADOR EN MEMORIA (Infrastructure Layer):
 * Implementación rápida, con cero dependencias externas, ideal para pruebas unitarias y e2e.
 */
export class InMemoryAccountRepositoryAdapter implements AccountRepositoryPort {
  private readonly accounts = new Map<string, Account>();

  async save(account: Account): Promise<void> {
    this.accounts.set(account.code, account);
  }

  async findByCode(code: string): Promise<Account | null> {
    const acc = this.accounts.get(code);
    return acc ? acc : null;
  }

  async findAll(): Promise<Account[]> {
    return Array.from(this.accounts.values()).sort((a, b) => a.code.localeCompare(b.code));
  }

  async delete(code: string): Promise<void> {
    this.accounts.delete(code);
  }

  async hasChildren(parentCode: string): Promise<boolean> {
    for (const [code] of this.accounts.entries()) {
      if (code !== parentCode && code.startsWith(parentCode)) {
        // Verificar si es hija directa
        const acc = this.accounts.get(code);
        if (acc && acc.getExpectedParentCode() === parentCode) {
          return true;
        }
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
    return children;
  }
}

