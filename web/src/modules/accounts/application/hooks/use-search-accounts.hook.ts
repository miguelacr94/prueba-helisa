import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../../../../shared/hooks/use-debounce.hook';
import { accountRepository } from '../../infrastructure/account-http.repository';
import type { Account } from '../../domain/models/account.model';

export const ACCOUNTS_SEARCH_QUERY_KEY = (query: string) => ['accounts', 'search', query] as const;

export interface UseSearchAccountsResult {
  debouncedTerm: string;
  isDebouncing: boolean;
  isSearching: boolean;
  searchResults: Account[];
  error: Error | null;
}

/**
 * Hook para buscar cuentas contables vía API con debounce reactivo.
 *
 * @param searchTerm Término de búsqueda en crudo ingresado por el usuario
 * @param delay Milisegundos de espera antes de disparar la petición HTTP (por defecto 350ms)
 */
export function useSearchAccounts(searchTerm: string, delay = 350): UseSearchAccountsResult {
  const cleanTerm = searchTerm.trim();
  const debouncedTerm = useDebounce(cleanTerm, delay);
  const isDebouncing = cleanTerm !== debouncedTerm;

  const query = useQuery<Account[], Error>({
    queryKey: ACCOUNTS_SEARCH_QUERY_KEY(debouncedTerm),
    queryFn: () => accountRepository.search(debouncedTerm),
    enabled: debouncedTerm.length > 0,
    staleTime: 1000 * 30, // 30 segundos en caché
  });

  return {
    debouncedTerm,
    isDebouncing,
    isSearching: (query.isLoading || query.isFetching) && debouncedTerm.length > 0,
    searchResults: query.data ?? [],
    error: query.error,
  };
}
