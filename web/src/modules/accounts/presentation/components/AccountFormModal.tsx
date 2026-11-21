import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { Modal } from '../../../../shared/components/Modal';
import { useUiStore } from '../../../../shared/store/ui.store';
import { useCreateAccount } from '../../application/hooks/use-create-account.hook';
import {
  createAccountFormSchema,
  type CreateAccountFormData,
} from '../../application/schemas/account-form.schema';
import {
  calculateAccountLevel,
  getExpectedParentCode,
} from '../../domain/models/account.model';
import { ApiException } from '../../../../shared/api/http-client';

export const AccountFormModal: React.FC = () => {
  const { isCreateModalOpen, closeCreateModal, prefillParentCode, prefillParentName } = useUiStore();
  const createMutation = useCreateAccount();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountFormSchema),
    defaultValues: {
      code: '',
      name: '',
      nature: 'DEBITO',
    },
  });

  const watchedCode = useWatch({ control, name: 'code' }) || '';
  const watchedNature = useWatch({ control, name: 'nature' }) || 'DEBITO';
  const detectedLevel = calculateAccountLevel(watchedCode);
  const expectedParent = getExpectedParentCode(watchedCode);
  const isClase = watchedCode.trim().length === 1;

  const handleClose = () => {
    setGeneralError(null);
    setSuccessMessage(null);
    closeCreateModal();
    reset();
  };

  useEffect(() => {
    if (isCreateModalOpen && prefillParentCode) {
      setValue('code', prefillParentCode);
    }
  }, [isCreateModalOpen, prefillParentCode, setValue]);

  const onSubmit = async (data: CreateAccountFormData) => {
    setGeneralError(null);
    setSuccessMessage(null);
    clearErrors();

    try {
      const created = await createMutation.mutateAsync({
        code: data.code.trim(),
        name: data.name.trim(),
        nature: isClase ? data.nature : undefined,
      });

      setSuccessMessage(`¡Cuenta ${created.code} (${created.name}) creada exitosamente!`);
      setTimeout(() => {
        handleClose();
      }, 700);
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        // Mapeo específico de errores del API Gateway al campo correspondiente
        if (
          err.code === 'ACCOUNT_ALREADY_EXISTS' ||
          err.code === 'PARENT_ACCOUNT_NOT_FOUND' ||
          err.code === 'INVALID_ACCOUNT_CODE'
        ) {
          setError('code', {
            type: 'server',
            message: err.message,
          });
        } else if (err.code === 'INVALID_ACCOUNT_NAME') {
          setError('name', {
            type: 'server',
            message: err.message,
          });
        } else if (err.code === 'INVALID_ACCOUNT_NATURE') {
          setError('nature', {
            type: 'server',
            message: err.message,
          });
        } else if (Array.isArray(err.details)) {
          // Errores de validación de class-validator
          err.details.forEach((detailMsg) => {
            const lower = String(detailMsg).toLowerCase();
            if (lower.includes('código') || lower.includes('code')) {
              setError('code', { type: 'server', message: String(detailMsg) });
            } else if (lower.includes('nombre') || lower.includes('name')) {
              setError('name', { type: 'server', message: String(detailMsg) });
            } else if (lower.includes('naturaleza') || lower.includes('nature')) {
              setError('nature', { type: 'server', message: String(detailMsg) });
            } else {
              setGeneralError(err.message);
            }
          });
        } else {
          setGeneralError(err.message);
        }
      } else if (err instanceof Error) {
        setGeneralError(err.message);
      } else {
        setGeneralError('Ocurrió un error inesperado al crear la cuenta.');
      }
    }
  };

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={handleClose}
      title="Crear Nueva Cuenta Contable"
      subtitle="Complete los datos para agregar una cuenta al catálogo PUC."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        {/* Banner contextual de Creación de Hija */}
        {prefillParentCode && (
          <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start space-x-2.5 animate-fade-in shadow-2xs">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Creando cuenta dependiente de: <span className="font-mono text-indigo-700">{prefillParentCode}</span>
                {prefillParentName ? ` (${prefillParentName})` : ''}
              </p>
              <p className="text-[11px] text-indigo-600 mt-0.5">
                El prefijo ha sido prellenado. Complete los dígitos para alcanzar el siguiente nivel.
              </p>
            </div>
          </div>
        )}

        {/* Alerta de Error General si no corresponde a un campo específico */}
        {generalError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-800 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold">Error al registrar</p>
              <p className="text-xs mt-0.5 text-rose-700">{generalError}</p>
            </div>
          </div>
        )}

        {/* Alerta de Éxito */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-emerald-800 text-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <p className="font-semibold text-sm">{successMessage}</p>
          </div>
        )}

        {/* Campo Código con error de validación local o del servidor */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Código Contable (Numérico)
            </label>
            <span className="text-[11px] text-slate-400">Longitud: 1, 2, 4 o 6</span>
          </div>
          <input
            type="text"
            placeholder="Ej: 1, 11, 1105, 110505"
            {...register('code')}
            className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.code
                ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/40'
                : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500 bg-white'
            }`}
          />

          {/* Error del campo Código (visible junto al campo) */}
          {errors.code && (
            <div className="flex items-center space-x-1.5 text-xs text-rose-600 mt-1.5 font-medium animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>{errors.code.message}</span>
            </div>
          )}

          {/* Detección en vivo de nivel y jerarquía */}
          {watchedCode.trim().length > 0 && !errors.code && (
            <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  Nivel detectado:{' '}
                  <span className="text-indigo-600 font-bold">
                    {detectedLevel ?? 'Longitud no permitida'}
                  </span>
                </span>
              </div>

              {isClase ? (
                <p className="text-slate-500">
                  Las clases no tienen padre. Defina la naturaleza a continuación.
                </p>
              ) : expectedParent ? (
                <p className="text-slate-500">
                  Cuenta padre requerida:{' '}
                  <span className="font-mono font-bold text-slate-800">{expectedParent}</span>{' '}
                  (Heredará su naturaleza).
                </p>
              ) : (
                <p className="text-amber-600">
                  Longitudes válidas en PUC: 1 (Clase), 2 (Grupo), 4 (Cuenta), 6 (Subcuenta).
                </p>
              )}
            </div>
          )}
        </div>

        {/* Campo Nombre con error visible junto al campo */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Nombre de la Cuenta
          </label>
          <input
            type="text"
            placeholder="Ej: ACTIVO, DISPONIBLE, CAJA, CAJA GENERAL"
            {...register('name')}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.name
                ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/40'
                : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500 bg-white'
            }`}
          />
          {errors.name && (
            <div className="flex items-center space-x-1.5 text-xs text-rose-600 mt-1.5 font-medium animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>{errors.name.message}</span>
            </div>
          )}
        </div>

        {/* Campo Naturaleza (Solo para Clase) */}
        {isClase ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Naturaleza Contable
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer font-semibold text-sm transition-all ${
                  watchedNature === 'DEBITO'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  value="DEBITO"
                  {...register('nature')}
                  className="sr-only"
                />
                <span>DÉBITO</span>
              </label>

              <label
                className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer font-semibold text-sm transition-all ${
                  watchedNature === 'CREDITO'
                    ? 'bg-purple-50 border-purple-500 text-purple-700 ring-2 ring-purple-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  value="CREDITO"
                  {...register('nature')}
                  className="sr-only"
                />
                <span>CRÉDITO</span>
              </label>
            </div>
            {errors.nature && (
              <div className="flex items-center space-x-1.5 text-xs text-rose-600 mt-1.5 font-medium animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span>{errors.nature.message}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              La naturaleza contable se hereda automáticamente de la cuenta padre en el catálogo.
            </span>
          </div>
        )}

        {/* Footer / Botones con estado de carga */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={handleClose}
            disabled={createMutation.isPending}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>Crear Cuenta</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
