import { useCallback } from 'react';
import { useToast } from '@/app/shared/hooks/useToast';
import { AppErrorHandler } from '@/app/lib/errorHandler';

type ErrorContext = Record<string, unknown>;

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback((
    error: unknown, 
    context?: ErrorContext
  ) => {
    const appError = AppErrorHandler.handleError(error, context);

    // Mostrar mensaje al usuario según el tipo de error
    switch (appError.type) {
      case 'auth':
        toast({
          message: appError.message || 'Error de autenticación'
        });
        break;

      case 'network':
        toast({
          message: 'Error de conexión. Por favor, verifica tu conexión a internet.'
        });
        break;

      case 'validation':
        toast({
          message: appError.message || 'Error de validación'
        });
        break;

      case 'storage':
        toast({
          message: 'Error al procesar el archivo. Por favor, intenta de nuevo.'
        });
        break;

      case 'database':
        toast({
          message: 'Error al acceder a los datos. Por favor, intenta más tarde.'
        });
        break;

      default:
        toast({
          message: 'Ha ocurrido un error inesperado. Por favor, intenta más tarde.'
        });
    }

    return appError;
  }, [toast]);

  const wrapAsync = useCallback(<TResult>(
    fn: () => Promise<TResult>,
    context?: ErrorContext
  ) => {
    return async (): Promise<TResult | null> => {
      try {
        return await fn();
      } catch (error) {
        handleError(error, context);
        return null;
      }
    };
  }, [handleError]);

  return {
    handleError,
    wrapAsync
  };
}