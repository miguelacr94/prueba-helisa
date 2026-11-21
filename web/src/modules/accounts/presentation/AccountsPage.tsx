import React from 'react';
import { Navbar } from '../../../shared/components/Navbar';
import { useAccountsTree } from '../application/hooks/use-accounts-tree.hook';
import { AccountTree } from './components/AccountTree';
import { AccountFormModal } from './components/AccountFormModal';
import { AccountDeleteDialog } from './components/AccountDeleteDialog';
import { BookMarked, Layers, ShieldCheck, GitBranch } from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const { data: tree = [], isLoading, isFetching, refetch, error } = useAccountsTree();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onRefresh={() => refetch()} isFetching={isFetching} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner de Reglas del Sistema */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-md shadow-indigo-950/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-2">
                <BookMarked className="w-3.5 h-3.5" />
                <span>Plan Único de Cuentas (PUC)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Gestor del Catálogo de Cuentas
              </h2>
              <p className="text-indigo-200 text-xs sm:text-sm mt-1 max-w-2xl">
                Estructura jerárquica con validación automática de prefijos, herencia de naturaleza
                contable y control de cuentas de movimiento.
              </p>
            </div>

            {/* Pill de Reglas Clave */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0 text-xs">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
                <div className="flex items-center space-x-2 text-indigo-200 font-bold">
                  <Layers className="w-4 h-4 text-indigo-300" />
                  <span>4 Niveles</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">1, 2, 4 y 6 dígitos</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
                <div className="flex items-center space-x-2 text-indigo-200 font-bold">
                  <GitBranch className="w-4 h-4 text-indigo-300" />
                  <span>Herencia</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">Débito / Crédito</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
                <div className="flex items-center space-x-2 text-indigo-200 font-bold">
                  <ShieldCheck className="w-4 h-4 text-indigo-300" />
                  <span>Integridad</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">Protección de hijas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error si la API falla */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center justify-between">
            <div>
              <p className="font-bold">Error de comunicación con la API</p>
              <p className="text-xs mt-0.5 text-rose-700">{error.message}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Árbol del Catálogo */}
        <AccountTree tree={tree} isLoading={isLoading} />
      </main>

      {/* Modales */}
      <AccountFormModal />
      <AccountDeleteDialog />
    </div>
  );
};

