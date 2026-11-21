import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from '../../../../shared/components/Modal';
import { useUiStore } from '../../../../shared/store/ui.store';
import { useDeleteAccount } from '../../application/hooks/use-delete-account.hook';
import { ApiException } from '../../../../shared/api/http-client';

export const AccountDeleteDialog: React.FC = () => {
  const { isDeleteDialogOpen, closeDeleteDialog, accountToDelete } = useUiStore();
  const deleteMutation = useDeleteAccount();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!accountToDelete) return null;

  const handleClose = () => {
    setDeleteError(null);
    closeDeleteDialog();
  };

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(accountToDelete.code);
      handleClose();
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setDeleteError(err.message);
      } else if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError('No se pudo eliminar la cuenta.');
      }
    }
  };

  return (
    <Modal
      isOpen={isDeleteDialogOpen}
      onClose={handleClose}
      title="Confirmar Eliminación de Cuenta"
      subtitle="Acción irreversible sobre el catálogo contable."
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-left">
        {/* Error devuelto por la API si tiene hijas o falla */}
        {deleteError && (
          <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-start space-x-2.5 animate-fade-in shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-rose-900">Operación Rechazada por la API</p>
              <p className="mt-1 leading-relaxed text-rose-800">{deleteError}</p>
            </div>
          </div>
        )}

        {/* Ficha de la cuenta seleccionada */}
        <div className="flex items-start space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-mono font-bold text-slate-900 text-sm">
              Código: {accountToDelete.code}
            </p>
            <p className="font-semibold text-slate-700 text-sm">{accountToDelete.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Nivel: {accountToDelete.level} • Naturaleza: {accountToDelete.nature}
            </p>
          </div>
        </div>

        {/* Advertencia preventiva si tiene hijas */}
        {accountToDelete.hasChildren && !deleteError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
            <p className="font-bold flex items-center space-x-1">
              <span>Advertencia contable:</span>
            </p>
            <p>
              Esta cuenta posee cuentas hijas asociadas. Según la regla de integridad contable, la
              API rechazará la eliminación si aún existen cuentas dependientes.
            </p>
          </div>
        )}

        {!accountToDelete.hasChildren && !deleteError && (
          <p className="text-sm text-slate-600">
            ¿Está seguro de que desea eliminar la cuenta{' '}
            <strong className="text-slate-900 font-mono">{accountToDelete.code}</strong> (
            {accountToDelete.name})?
          </p>
        )}

        {/* Botones de acción con estado de carga */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {deleteError ? 'Cerrar' : 'Cancelar'}
          </button>

          {!deleteError && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <span>Confirmar Eliminación</span>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
