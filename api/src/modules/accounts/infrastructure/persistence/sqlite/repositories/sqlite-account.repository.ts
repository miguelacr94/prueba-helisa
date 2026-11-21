import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AccountRepositoryPort } from '../../../../domain/ports/account.repository.port.js';
import type { Account } from '../../../../domain/entities/account.entity.js';
import { AccountOrmEntity } from '../entities/account.orm-entity.js';
import { AccountOrmMapper } from '../mappers/account.orm-mapper.js';

@Injectable()
export class SqliteAccountRepository implements AccountRepositoryPort {
  constructor(
    @InjectRepository(AccountOrmEntity)
    private readonly repository: Repository<AccountOrmEntity>,
  ) {}

  async save(account: Account): Promise<void> {
    const ormEntity = AccountOrmMapper.toOrm(account);
    await this.repository.save(ormEntity);
  }

  async findByCode(code: string): Promise<Account | null> {
    const found = await this.repository.findOne({ where: { code } });
    if (!found) {
      return null;
    }
    const hasKids = await this.hasChildren(code);
    return AccountOrmMapper.toDomain(found, hasKids);
  }

  async findAll(): Promise<Account[]> {
    const entities = await this.repository.find({ order: { code: 'ASC' } });
    const parentCodes = new Set(
      entities
        .map((e) => e.parentCode)
        .filter((pc): pc is string => typeof pc === 'string' && pc.length > 0),
    );

    return entities.map((e) => AccountOrmMapper.toDomain(e, parentCodes.has(e.code)));
  }

  async delete(code: string): Promise<void> {
    await this.repository.delete({ code });
  }

  async hasChildren(parentCode: string): Promise<boolean> {
    const count = await this.repository.count({ where: { parentCode } });
    return count > 0;
  }

  async findChildren(parentCode: string): Promise<Account[]> {
    const children = await this.repository.find({
      where: { parentCode },
      order: { code: 'ASC' },
    });
    return children.map((c) => AccountOrmMapper.toDomain(c, false));
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}

