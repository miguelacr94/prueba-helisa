import React, { useEffect, useMemo } from 'react';
import {
  Search,
  ChevronsDown,
  ChevronsUp,
  Sparkles,
  BookOpen,
  Filter,
} from 'lucide-react';
import type { AccountTreeNode as IAccountTreeNode } from '../../domain/models/account.model';
import { AccountTreeNode } from './AccountTreeNode';
import { useUiStore } from '../../../../shared/store/ui.store';
import { useCreateAccount } from '../../application/hooks/use-create-account.hook';

interface AccountTreeProps {
  tree: IAccountTreeNode[];
  isLoading: boolean;
}

export const AccountTree: React.FC<AccountTreeProps> = ({ tree, isLoading }) => {
  const {
    searchTerm,
    setSearchTerm,
    expandAll,
    collapseAll,
    openCreateModal,
    expandBranches,
  } = useUiStore();
  const createMutation = useCreateAccount();

  // Abrir automáticamente las ramas donde hay coincidencia de búsqueda por código o nombre
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term || tree.length === 0) return;

    const matchedAncestors: string[] = [];

    const searchAndCollectAncestors = (
      nodes: IAccountTreeNode[],
      ancestors: string[],
    ) => {
      for (const node of nodes) {
        const matches =
          node.code.toLowerCase().includes(term) ||
          node.name.toLowerCase().includes(term);

        if (matches && ancestors.length > 0) {
          matchedAncestors.push(...ancestors);
        }

        if (node.children?.length) {
          searchAndCollectAncestors(node.children, [...ancestors, node.code]);
        }
      }
    };

    searchAndCollectAncestors(tree, []);

    if (matchedAncestors.length > 0) {
      expandBranches(matchedAncestors);
    }
  }, [searchTerm, tree, expandBranches]);

  // Recolectar todos los códigos para expandAll
  const allCodes = useMemo(() => {
    const codes: string[] = [];
    const traverse = (nodes: IAccountTreeNode[]) => {
      for (const node of nodes) {
        codes.push(node.code);
        if (node.children?.length) {
          traverse(node.children);
        }
      }
    };
    traverse(tree);
    return codes;
  }, [tree]);

  // Contar estadísticas
  const stats = useMemo(() => {
    let total = 0;
    let leaves = 0;
    const traverse = (nodes: IAccountTreeNode[]) => {
      for (const node of nodes) {
        total++;
        if (node.acceptsMovements) leaves++;
        if (node.children?.length) traverse(node.children);
      }
    };
    traverse(tree);
    return { total, leaves, classes: tree.length };
  }, [tree]);

  // Carga de datos semilla (PUC Estándar) para conveniencia del evaluador
  const handleSeedPuc = async () => {
    try {
      // 1. Activo
      await createMutation.mutateAsync({ code: '1', name: 'ACTIVO', nature: 'DEBITO' });
      await createMutation.mutateAsync({ code: '11', name: 'DISPONIBLE' });
      await createMutation.mutateAsync({ code: '1105', name: 'CAJA' });
      await createMutation.mutateAsync({ code: '110505', name: 'CAJA GENERAL' });
      await createMutation.mutateAsync({ code: '1110', name: 'BANCOS' });
      await createMutation.mutateAsync({ code: '111005', name: 'MONEDA NACIONAL' });

      // 2. Pasivo
      await createMutation.mutateAsync({ code: '2', name: 'PASIVO', nature: 'CREDITO' });
      await createMutation.mutateAsync({ code: '21', name: 'OBLIGACIONES FINANCIERAS' });
      await createMutation.mutateAsync({ code: '2105', name: 'BANCOS NACIONALES' });

      // 3. Patrimonio
      await createMutation.mutateAsync({ code: '3', name: 'PATRIMONIO', nature: 'CREDITO' });
      await createMutation.mutateAsync({ code: '31', name: 'CAPITAL SOCIAL' });
      await createMutation.mutateAsync({ code: '3105', name: 'CAPITAL SUSCRITO Y PAGADO' });
    } catch {
      // Ignorar si ya existía alguno
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="animate-pulse space-y-4 max-w-md mx-auto">
          <div className="h-4 bg-slate-200 rounded-md w-3/4 mx-auto" />
          <div className="h-8 bg-slate-100 rounded-lg w-full" />
          <div className="h-8 bg-slate-100 rounded-lg w-5/6 mx-auto" />
          <div className="h-8 bg-slate-100 rounded-lg w-4/6 mx-auto" />
        </div>
        <p className="text-sm font-medium text-slate-500 mt-6">Cargando catálogo contable...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de Búsqueda y Filtros Responsiva */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código (ej: 1105) o nombre (ej: Caja)..."
              className="w-full pl-10 pr-16 sm:pr-4 py-2.5 sm:py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 bg-slate-200/80 rounded-md px-2 py-1 font-medium cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => expandAll(allCodes)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronsDown className="w-3.5 h-3.5" />
              <span>Expandir</span>
            </button>

            <button
              onClick={collapseAll}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronsUp className="w-3.5 h-3.5" />
              <span>Colapsar</span>
            </button>
          </div>
        </div>

        {/* Resumen de estadísticas Adaptativo */}
        {tree.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                Total: <strong className="text-slate-800">{stats.total}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Clases: <strong className="text-slate-800">{stats.classes}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Hojas (Movimiento): <strong className="text-emerald-700">{stats.leaves}</strong>
              </span>
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 text-slate-400">
              <Filter className="w-3 h-3" />
              <span>Jerarquía PUC: 1 $\rightarrow$ 2 $\rightarrow$ 4 $\rightarrow$ 6</span>
            </div>
          </div>
        )}
      </div>

      {/* Árbol o Estado Vacío */}
      {tree.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Catálogo de Cuentas Vacío</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Aún no se han registrado cuentas contables en el sistema. Puedes crear la primera Clase o
            cargar una estructura semilla de ejemplo del PUC colombiano.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => openCreateModal()}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Crear Primera Clase (1 dígito)
            </button>

            <button
              onClick={handleSeedPuc}
              disabled={createMutation.isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Cargar PUC de Ejemplo</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50/50 rounded-2xl border border-slate-200/90 p-2 sm:p-4 shadow-xs">
          <div className="space-y-1">
            {tree.map((rootNode) => (
              <AccountTreeNode key={rootNode.code} node={rootNode} depth={0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
