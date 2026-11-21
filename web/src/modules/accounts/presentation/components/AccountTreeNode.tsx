import React from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  FolderTree,
  FileSpreadsheet,
} from 'lucide-react';
import {
  type AccountTreeNode as IAccountTreeNode,
  getLevelBadgeStyle,
} from '../../domain/models/account.model';
import { Badge } from '../../../../shared/components/Badge';
import { useUiStore } from '../../../../shared/store/ui.store';

interface AccountTreeNodeProps {
  node: IAccountTreeNode;
  depth?: number;
}

export const AccountTreeNode: React.FC<AccountTreeNodeProps> = ({ node, depth = 0 }) => {
  const {
    expandedNodes,
    toggleNode,
    openCreateModal,
    openDeleteDialog,
    searchTerm,
  } = useUiStore();

  const isExpanded = expandedNodes[node.code] ?? true;
  const hasChildren = node.children && node.children.length > 0;
  const canHaveChildren = node.code.length < 6; // Solo hasta 4 dígitos (Cuenta) pueden tener Subcuentas (6 dígitos)

  const levelInfo = getLevelBadgeStyle(node.level);
  const isNatureDebit = node.nature === 'DEBITO';

  // Highlight search
  const isSearchMatch =
    searchTerm.trim() !== '' &&
    (node.code.includes(searchTerm.trim()) ||
      node.name.toLowerCase().includes(searchTerm.trim().toLowerCase()));

  return (
    <div className="select-none transition-colors">
      <div
        className={`group flex items-center justify-between py-2 px-3 rounded-xl border transition-all ${
          isSearchMatch
            ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-100'
            : 'bg-white hover:bg-slate-50/80 border-slate-200/80 hover:border-slate-300'
        } mb-1.5 shadow-2xs`}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        {/* Lado izquierdo: Chevron, Código, Nombre, Nivel */}
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.code)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <span className="w-6 flex items-center justify-center text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </span>
          )}

          {/* Ícono de tipo */}
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              node.hasChildren
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {node.hasChildren ? (
              <FolderTree className="w-4 h-4" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
          </div>

          {/* Código y Nombre */}
          <div className="flex items-baseline space-x-2 truncate">
            <span className="font-mono font-bold text-sm text-slate-900 tracking-tight">
              {node.code}
            </span>
            <span className="text-sm font-semibold text-slate-700 truncate">
              {node.name}
            </span>
          </div>

          {/* Badge de Nivel */}
          <span
            className={`hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md border ${levelInfo.badgeClass}`}
          >
            {node.level}
          </span>
        </div>

        {/* Lado derecho: Naturaleza, Movimientos, Acciones */}
        <div className="flex items-center space-x-2 shrink-0 ml-3">
          {/* Badge Naturaleza */}
          <Badge variant={isNatureDebit ? 'info' : 'purple'}>
            {isNatureDebit ? 'DÉBITO' : 'CRÉDITO'}
          </Badge>

          {/* Badge Movimientos */}
          {node.acceptsMovements ? (
            <Badge variant="success" className="hidden md:inline-flex">
              Admite Movimientos
            </Badge>
          ) : (
            <Badge variant="warning" className="hidden md:inline-flex">
              Con Hijas
            </Badge>
          )}

          {/* Botones de acción */}
          <div className="flex items-center space-x-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {canHaveChildren && (
              <button
                onClick={() => openCreateModal(node.code)}
                title={`Crear cuenta hija dependiente de ${node.code}`}
                className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Hija</span>
              </button>
            )}

            <button
              onClick={() => openDeleteDialog(node)}
              title={
                node.hasChildren
                  ? `Intentar eliminar cuenta ${node.code} (tiene hijas)`
                  : `Eliminar cuenta ${node.code}`
              }
              className="p-1.5 rounded-md transition-colors cursor-pointer text-rose-500 hover:text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Renderizado recursivo de hijos */}
      {hasChildren && isExpanded && (
        <div className="relative">
          <div className="absolute left-[11px] top-0 bottom-2 w-px bg-slate-200/80 -z-10" />
          {node.children.map((child) => (
            <AccountTreeNode key={child.code} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
