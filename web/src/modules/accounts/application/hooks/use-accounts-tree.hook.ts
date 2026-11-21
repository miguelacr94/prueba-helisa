import { useQuery } from '@tanstack/react-query';
import { accountRepository } from '../../infrastructure/account-http.repository';
import type { AccountTreeNode } from '../../domain/models/account.model';

export const ACCOUNTS_TREE_QUERY_KEY = ['accounts', 'tree'] as const;

export function useAccountsTree() {
  return useQuery<AccountTreeNode[], Error>({
    queryKey: ACCOUNTS_TREE_QUERY_KEY,
    queryFn: () => accountRepository.getTree(),
    staleTime: 1000 * 60 * 2,
  });
}
