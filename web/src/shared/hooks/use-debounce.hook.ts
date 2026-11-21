import { useEffect, useState } from 'react';

/**
 * Hook personalizado para aplicar debounce a un valor reactivo.
 * Retrasa la actualización del valor hasta que transcurran `delay` milisegundos sin cambios.
 *
 * @param value Valor de entrada que cambia frecuentemente (ej: término de búsqueda)
 * @param delay Tiempo de espera en milisegundos (por defecto: 350ms)
 * @returns El valor estabilizado tras el debounce
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
