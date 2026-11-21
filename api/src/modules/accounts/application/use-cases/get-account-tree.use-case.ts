import { Inject, Injectable } from '@nestjs/common';
import type { AccountRepositoryPort } from '../../domain/ports/account.repository.port.js';
import { ACCOUNT_REPOSITORY_TOKEN } from '../../accounts.tokens.js';
import { toAccountOutputDto } from '../dtos/account-output.dto.js';
import { AccountTreeNodeDto } from '../dtos/account-tree-node.dto.js';

@Injectable()
export class GetAccountTreeUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY_TOKEN)
    private readonly repository: AccountRepositoryPort,
  ) {}

  async execute(): Promise<AccountTreeNodeDto[]> {
    const accounts = await this.repository.findAll();
    // Ordenar ascendentemente por código
    accounts.sort((a, b) => a.code.localeCompare(b.code));

    const nodeMap = new Map<string, AccountTreeNodeDto>();
    const roots: AccountTreeNodeDto[] = [];

    for (const account of accounts) {
      const output = toAccountOutputDto(account);
      const node: AccountTreeNodeDto = {
        ...output,
        children: [],
      };
      nodeMap.set(account.code, node);
    }

    for (const account of accounts) {
      const node = nodeMap.get(account.code)!;
      const parentCode = account.getExpectedParentCode();

      if (parentCode && nodeMap.has(parentCode)) {
        const parentNode = nodeMap.get(parentCode)!;
        parentNode.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}
