import React from 'react';
import { BookOpen, PlusCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { useUiStore } from '../store/ui.store';

interface NavbarProps {
  onRefresh?: () => void;
  isFetching?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, isFetching }) => {
  const openCreateModal = useUiStore((state) => state.openCreateModal);
  const swaggerUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/docs`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
              Catálogo de Cuentas Contables (PUC)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Estructura Jerárquica & Reglas de Naturaleza
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isFetching}
              title="Recargar catálogo"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          )}

          <a
            href={swaggerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-all"
          >
            <span>Swagger API</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => openCreateModal()}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-200 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Cuenta</span>
          </button>
        </div>
      </div>
    </header>
  );
};

