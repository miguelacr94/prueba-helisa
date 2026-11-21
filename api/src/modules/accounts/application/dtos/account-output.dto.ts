import { AccountLevel } from '../../domain/enums/account-level.enum.js';
import { AccountNature } from '../../domain/enums/account-nature.enum.js';
import { Account } from '../../domain/entities/account.entity.js';

export interface AccountOutputDto {
  code: string;
  name: string;
  nature: AccountNature;
  level: AccountLevel;
  hasChildren: boolean;
  acceptsMovements: boolean;
  parentCode: string | null;
}

export function toAccountOutputDto(account: Account): AccountOutputDto {
  return {
    code: account.code,
    name: account.name,
    nature: account.nature,
    level: account.level,
    hasChildren: account.hasChildren,
    acceptsMovements: account.acceptsMovements(),
    parentCode: account.getExpectedParentCode(),
  };
}

