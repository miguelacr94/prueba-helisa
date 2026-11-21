import React from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
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
    openRenameModal,
    openDeleteDialog,
    searchTerm,
    matchedCodes,
  } = useUiStore();

  const isExpanded = expandedNodes[node.code] ?? true;
  const hasChildren = node.children && node.children.length > 0;
  const canHaveChildren = node.code.length < 6; // Solo hasta 4 dígitos (Cuenta) pueden tener Subcuentas (6 dígitos)

  const levelInfo = getLevelBadgeStyle(node.level);
  const isNatureDebit = node.nature === 'DEBITO';

  // Highlight search: coincide vía API (matchedCodes) o filtro reactivo preventivo
  const cleanSearch = searchTerm.trim().toLowerCase();
  const isSearchMatch =
    cleanSearch !== '' &&
    (matchedCodes.includes(node.code) ||
      node.code.toLowerCase().includes(cleanSearch) ||
      node.name.toLowerCase().includes(cleanSearch));

  return (
    <div className="select-none transition-colors">
      <div
        style={{ '--tree-depth': depth } as React.CSSProperties}
        className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between py-2 sm:py-2 px-2.5 sm:px-3 rounded-xl border transition-all ${
          isSearchMatch
            ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-100'
            : 'bg-white hover:bg-slate-50/80 border-slate-200/80 hover:border-slate-300'
        } mb-1.5 shadow-2xs gap-1.5 sm:gap-2 ml-[calc(var(--tree-depth)*8px)] sm:ml-[calc(var(--tree-depth)*20px)]`}
      >
        {/* Lado izquierdo (Fila 1 en móvil): Chevron, Icono, Código, Nombre, Nivel */}
        <div className="flex items-center space-x-2 min-w-0 w-full sm:w-auto sm:flex-1">
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.code)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <span className="w-6 flex items-center justify-center text-slate-300 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </span>
          )}

          {/* Ícono de tipo */}
          <div
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 ${
              node.hasChildren
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {node.hasChildren ? (
              <FolderTree className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </div>

          {/* Código y Nombre */}
          <div className="flex items-baseline space-x-1.5 min-w-0 flex-1 truncate">
            <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 tracking-tight shrink-0">
              {node.code}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate" title={node.name}>
              {node.name}
            </span>
          </div>

          {/* Badge de Nivel */}
          <span
            className={`inline-flex text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md border shrink-0 ${levelInfo.badgeClass}`}
          >
            {node.level}
          </span>
        </div>

        {/* Lado derecho (Fila 2 en móvil): Naturaleza, Movimientos, Acciones */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-1.5 sm:space-x-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 pl-6 sm:pl-0">
          {/* Badges de Naturaleza y Movimientos */}
          <div className="flex items-center space-x-1.5">
            <Badge variant={isNatureDebit ? 'info' : 'purple'} className="font-bold text-[9px] sm:text-[10px] px-1.5 sm:px-2">
              {isNatureDebit ? 'DÉBITO' : 'CRÉDITO'}
            </Badge>

            {node.acceptsMovements ? (
              <Badge variant="success" className="text-[9px] sm:text-[10px] px-1.5 sm:px-2">
                <span className="hidden xs:inline">Admite </span>Movimientos
              </Badge>
            ) : (
              <Badge variant="warning" className="text-[9px] sm:text-[10px] px-1.5 sm:px-2">
                Con Hijas
              </Badge>
            )}
          </div>

          {/* Botones de acción (visibles siempre en touch/móvil, en hover en desktop) */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {canHaveChildren && (
              <button
                onClick={() => openCreateModal(node.code, node.name)}
                title={`Crear cuenta hija dependiente de ${node.code} (${node.name})`}
                className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Hija</span>
              </button>
            )}

            <button
              onClick={() => openRenameModal(node)}
              title={`Renombrar cuenta ${node.code}`}
              className="p-1.5 rounded-md transition-colors cursor-pointer text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => openDeleteDialog(node)}
              title={
                node.hasChildren
                  ? `Intentar eliminar cuenta ${node.code} (tiene hijas)`
                  : `Eliminar cuenta ${node.code}`
              }
              className="p-1.5 rounded-md transition-colors cursor-pointer text-rose-500 hover:text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Renderizado recursivo de hijos con línea guía */}
      {hasChildren && isExpanded && (
        <div className="relative">
          <div className="absolute left-[7px] sm:left-[9px] top-0 bottom-2 w-px bg-slate-200/80 -z-10" />
          {node.children.map((child) => (
            <AccountTreeNode key={child.code} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
