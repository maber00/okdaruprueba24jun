// src/app/shared/hooks/useToast.ts
import { useEffect } from "react";
import { ToastService } from "../utils/toastService";
import { ToastActionElement } from "../components/ui/toast";

interface UseToastProps {
  message: string;
  action?: ToastActionElement;
  duration?: number;
}

export const useToast = ({ message, action, duration = 5000 }: UseToastProps) => {
  useEffect(() => {
    if (!message) return;

    const toastId = ToastService.create({
      message,
      action,
      duration,
    });

    return () => {
      ToastService.dismiss(toastId);
    };
  }, [message, action, duration]);
};


// Ejemplo de uso:
/*
function MyComponent() {
  const { success, error, withAction } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      success('Los datos se guardaron correctamente');
    } catch (err) {
      error('Error al guardar los datos');
    }
  };

  const handleDelete = () => {
    withAction(
      '¿Estás seguro de eliminar este elemento?',
      'Deshacer',
      () => {
        // Lógica para deshacer la eliminación
        console.log('Eliminación deshecha');
      },
      'Elemento eliminado'
    );
  };

  return (
    <div>
      <button onClick={handleSave}>Guardar</button>
      <button onClick={handleDelete}>Eliminar</button>
    </div>
  );
}
*/