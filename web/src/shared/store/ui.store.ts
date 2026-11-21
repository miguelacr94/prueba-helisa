import { create } from 'zustand';
import type { Account } from '../../modules/accounts/domain/models/account.model';

interface UiState {
  searchTerm: string;
  matchedCodes: string[];
  selectedAccount: Account | null;
  isCreateModalOpen: boolean;
  prefillParentCode: string | null;
  prefillParentName: string | null;
  isRenameModalOpen: boolean;
  accountToRename: Account | null;
  isDeleteDialogOpen: boolean;
  accountToDelete: Account | null;
  expandedNodes: Record<string, boolean>;

  setSearchTerm: (term: string) => void;
  setMatchedCodes: (codes: string[]) => void;
  setSelectedAccount: (account: Account | null) => void;
  openCreateModal: (parentCode?: string, parentName?: string) => void;
  closeCreateModal: () => void;
  openRenameModal: (account: Account) => void;
  closeRenameModal: () => void;
  openDeleteDialog: (account: Account) => void;
  closeDeleteDialog: () => void;
  toggleNode: (code: string) => void;
  expandAll: (codes: string[]) => void;
  collapseAll: () => void;
  expandBranches: (codes: string[]) => void;
}

export const useUiStore = create<UiState>((set) => ({
  searchTerm: '',
  matchedCodes: [],
  selectedAccount: null,
  isCreateModalOpen: false,
  prefillParentCode: null,
  prefillParentName: null,
  isRenameModalOpen: false,
  accountToRename: null,
  isDeleteDialogOpen: false,
  accountToDelete: null,
  expandedNodes: {},

  setSearchTerm: (searchTerm) =>
    set((state) => ({
      searchTerm,
      matchedCodes: searchTerm.trim() === '' ? [] : state.matchedCodes,
    })),
  setMatchedCodes: (matchedCodes) =>
    set((state) => {
      const isSame =
        state.matchedCodes.length === matchedCodes.length &&
        state.matchedCodes.every((code, i) => code === matchedCodes[i]);
      // Retornar el mismo estado evita notificaciones y re-renders innecesarios
      return isSame ? state : { matchedCodes };
    }),
  setSelectedAccount: (selectedAccount) => set({ selectedAccount }),
  openCreateModal: (prefillParentCode = '', prefillParentName = '') =>
    set({
      isCreateModalOpen: true,
      prefillParentCode: prefillParentCode || null,
      prefillParentName: prefillParentName || null,
    }),
  closeCreateModal: () =>
    set({ isCreateModalOpen: false, prefillParentCode: null, prefillParentName: null }),
  openRenameModal: (accountToRename) => set({ isRenameModalOpen: true, accountToRename }),
  closeRenameModal: () => set({ isRenameModalOpen: false, accountToRename: null }),
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
  expandBranches: (codes) =>
    set((state) => {
      const updated = { ...state.expandedNodes };
      codes.forEach((c) => {
        updated[c] = true;
      });
      return { expandedNodes: updated };
    }),
}));
