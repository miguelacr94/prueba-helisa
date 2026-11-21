import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, CheckCircle2, Edit3, Loader2 } from 'lucide-react';
import { Modal } from '../../../../shared/components/Modal';
import { useUiStore } from '../../../../shared/store/ui.store';
import { useRenameAccount } from '../../application/hooks/use-rename-account.hook';
import { ApiException } from '../../../../shared/api/http-client';

const renameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe contener al menos 2 caracteres.')
    .max(100, 'El nombre no puede exceder 100 caracteres.'),
});

type RenameFormData = z.infer<typeof renameSchema>;

export const AccountRenameModal: React.FC = () => {
  const { isRenameModalOpen, closeRenameModal, accountToRename } = useUiStore();
  const renameMutation = useRenameAccount();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RenameFormData>({
    resolver: zodResolver(renameSchema),
    defaultValues: {
      name: '',
    },
  });

  const handleClose = () => {
    setServerError(null);
    setSuccessMessage(null);
    closeRenameModal();
    reset();
  };

  useEffect(() => {
    if (isRenameModalOpen && accountToRename) {
      setValue('name', accountToRename.name);
    }
  }, [isRenameModalOpen, accountToRename, setValue]);

  if (!accountToRename) return null;

  const onSubmit = async (data: RenameFormData) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      await renameMutation.mutateAsync({
        code: accountToRename.code,
        newName: data.name.trim(),
      });

      setSuccessMessage('¡Nombre actualizado exitosamente!');
      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        setServerError(err.message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('No se pudo renombrar la cuenta.');
      }
    }
  };

  return (
    <Modal
      isOpen={isRenameModalOpen}
      onClose={handleClose}
      title="Renombrar Cuenta Contable"
      subtitle="Actualice la descripción de la cuenta en el catálogo."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        {serverError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-800 text-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <p className="font-medium">{serverError}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-emerald-800 text-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Ficha de la cuenta */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
          <p className="text-slate-500">
            Código:{' '}
            <strong className="font-mono text-slate-900 text-sm">{accountToRename.code}</strong>
          </p>
          <p className="text-slate-500">
            Nivel: <strong className="text-slate-800">{accountToRename.level}</strong> • Naturaleza:{' '}
            <strong className="text-slate-800">{accountToRename.nature}</strong>
          </p>
        </div>

        {/* Campo Nombre */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Nuevo Nombre de la Cuenta
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ingrese el nuevo nombre..."
              {...register('name')}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/40'
                  : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500 bg-white'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Botones */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={renameMutation.isPending}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={renameMutation.isPending}
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {renameMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Actualizando...</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
