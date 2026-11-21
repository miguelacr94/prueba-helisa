import { create } from 'zustand';
import type { Account } from '../../modules/accounts/domain/models/account.model';

interface UiState {
  searchTerm: string;
  selectedAccount: Account | null;
  isCreateModalOpen: boolean;
  prefillParentCode: string | null;
  isDeleteDialogOpen: boolean;
  accountToDelete: Account | null;
  expandedNodes: Record<string, boolean>;

  setSearchTerm: (term: string) => void;
  setSelectedAccount: (account: Account | null) => void;
  openCreateModal: (parentCode?: string) => void;
  closeCreateModal: () => void;
  openDeleteDialog: (account: Account) => void;
  closeDeleteDialog: () => void;
  toggleNode: (code: string) => void;
  expandAll: (codes: string[]) => void;
  collapseAll: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  searchTerm: '',
  selectedAccount: null,
  isCreateModalOpen: false,
  prefillParentCode: null,
  isDeleteDialogOpen: false,
  accountToDelete: null,
  expandedNodes: {},

  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setSelectedAccount: (selectedAccount) => set({ selectedAccount }),
  openCreateModal: (prefillParentCode = '') =>
    set({ isCreateModalOpen: true, prefillParentCode: prefillParentCode || null }),
  closeCreateModal: () => set({ isCreateModalOpen: false, prefillParentCode: null }),
  openDeleteDialog: (accountToDelete) => set({ isDeleteDialogOpen: true, accountToDelete }),
  closeDeleteDialog: () => set({ isDeleteDialogOpen: false, accountToDelete: null }),
  toggleNode: (code) =>
    set((state) => ({
      expandedNodes: {
        ...state.expandedNodes,
        [code]: !state.expandedNodes[code],
      },
    })),
  expandAll: (codes) =>
    set(() => {
      const all: Record<string, boolean> = {};
      codes.forEach((c) => (all[c] = true));
      return { expandedNodes: all };
    }),
  collapseAll: () => set({ expandedNodes: {} }),
}));
