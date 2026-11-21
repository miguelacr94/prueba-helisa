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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Logo & Título responsivo */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
              <span className="sm:hidden">PUC Helisa</span>
              <span className="hidden sm:inline">Catálogo de Cuentas Contables (PUC)</span>
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 font-medium truncate">
              Estructura Jerárquica & Reglas de Naturaleza
            </p>
          </div>
        </div>

        {/* Acciones del Navbar responsivas */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isFetching}
              title="Recargar catálogo"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          )}

          <a
            href={swaggerUrl}
            target="_blank"
            rel="noreferrer"
            title="Documentación interactiva Swagger OpenAPI"
            className="inline-flex items-center space-x-1 sm:space-x-1.5 p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-all"
          >
            <span className="hidden md:inline">Swagger API</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => openCreateModal()}
            className="inline-flex items-center space-x-1.5 px-3 py-2 sm:px-4 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-200 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="hidden xs:inline">Nueva Cuenta</span>
            <span className="xs:hidden">Crear</span>
          </button>
        </div>
      </div>
    </header>
  );
};

