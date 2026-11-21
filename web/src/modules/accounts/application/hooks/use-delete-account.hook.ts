import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountRepository } from '../../infrastructure/account-http.repository';
import { ACCOUNTS_TREE_QUERY_KEY } from './use-accounts-tree.hook';

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => accountRepository.delete(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_TREE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['accounts', 'all'] });
    },
  });
}

