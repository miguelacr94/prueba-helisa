import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountRepository } from '../../infrastructure/account-http.repository';
import { ACCOUNTS_TREE_QUERY_KEY } from './use-accounts-tree.hook';

export function useRenameAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, newName }: { code: string; newName: string }) =>
      accountRepository.rename(code, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_TREE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['accounts', 'all'] });
    },
  });
}
