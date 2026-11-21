import { Account } from '../../../../domain/entities/account.entity.js';
import { AccountNature } from '../../../../domain/enums/account-nature.enum.js';
import { AccountOrmEntity } from '../entities/account.orm-entity.js';

export class AccountOrmMapper {
  public static toDomain(orm: AccountOrmEntity, hasChildren = false): Account {
    return Account.reconstruct({
      code: orm.code,
      name: orm.name,
      nature: orm.nature as AccountNature,
      hasChildren,
    });
  }

  public static toOrm(domain: Account): AccountOrmEntity {
    const orm = new AccountOrmEntity();
    orm.code = domain.code;
    orm.name = domain.name;
    orm.level = domain.level;
    orm.nature = domain.nature;
    orm.parentCode = domain.getExpectedParentCode();
    return orm;
  }
}

