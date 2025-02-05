// src/app/lib/errorHandler.ts
import { FirebaseError } from 'firebase/app';
import { authLogger } from './logger';

export type ErrorType = 
  | 'auth'
  | 'network'
  | 'validation'
  | 'storage'
  | 'database'
  | 'unknown';

export interface AppError extends Error {
  type: ErrorType;
  code?: string;
  originalError?: unknown;
  context?: Record<string, unknown>;
}

export class AppErrorHandler {
  static createError(
    message: string,
    type: ErrorType,
    originalError?: unknown,
    context?: Record<string, unknown>
  ): AppError {
    const error = new Error(message) as AppError;
    error.type = type;
    error.originalError = originalError;
    error.context = context;

    if (originalError instanceof FirebaseError) {
      error.code = originalError.code;
    }

    return error;
  }

  static handleError(error: unknown, context?: Record<string, unknown>): AppError {
    let appError: AppError;

    if (error instanceof FirebaseError) {
      appError = this.handleFirebaseError(error, context);
    } else if (error instanceof TypeError) {
      appError = this.createError(
        'Error de tipo inesperado',
        'validation',
        error,
        context
      );
    } else if (error instanceof Error) {
      appError = this.createError(
        error.message,
        'unknown',
        error,
        context
      );
    } else {
      appError = this.createError(
        'Error desconocido',
        'unknown',
        error,
        context
      );
    }

    // Log del error
    this.logError(appError);

    return appError;
  }

  private static handleFirebaseError(error: FirebaseError, context?: Record<string, unknown>): AppError {
    let message: string;
    let type: ErrorType = 'unknown';

    switch (error.code) {
      // Auth errors
      case 'auth/user-not-found':
        message = 'Usuario no encontrado';
        type = 'auth';
        break;
      case 'auth/wrong-password':
        message = 'Contraseña incorrecta';
        type = 'auth';
        break;
      case 'auth/email-already-in-use':
        message = 'El email ya está en uso';
        type = 'auth';
        break;
      
      // Storage errors
      case 'storage/unauthorized':
        message = 'No tienes permisos para realizar esta operación';
        type = 'storage';
        break;
      case 'storage/canceled':
        message = 'Operación cancelada';
        type = 'storage';
        break;
      
      // Database errors
      case 'permission-denied':
        message = 'No tienes permisos para acceder a estos datos';
        type = 'database';
        break;
      
      // Network errors
      case 'network-request-failed':
        message = 'Error de conexión';
        type = 'network';
        break;
      
      default:
        message = error.message;
        type = 'unknown';
    }

    return this.createError(message, type, error, context);
  }

  private static logError(error: AppError): void {
    authLogger.error(
      'AppErrorHandler',
      error.message,
      {
        type: error.type,
        code: error.code,
        context: error.context,
        originalError: error.originalError
      }
    );
  }

  static isAppError(error: unknown): error is AppError {
    return error instanceof Error && 'type' in error;
  }
}