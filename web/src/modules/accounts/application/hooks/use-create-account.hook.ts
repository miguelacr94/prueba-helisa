import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountRepository } from '../../infrastructure/account-http.repository';
import type { CreateAccountInput } from '../../domain/models/account.model';
import { ACCOUNTS_TREE_QUERY_KEY } from './use-accounts-tree.hook';

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAccountInput) => accountRepository.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_TREE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['accounts', 'all'] });
    },
  });
}
