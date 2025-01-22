// src/app/shared/hooks/useToast.ts
// src/app/shared/hooks/useToast.ts
import { toast } from "@/app/shared/components/ui/toast";
import type { ToastActionElement } from "@/app/shared/components/ui/toast";

interface ToastOptions {
  message: string;  // Cambiado de description a message
  action?: ToastActionElement;
  duration?: number;
}

export function useToast() {
  const showToast = (options: ToastOptions) => {
    return toast({
      description: options.message,  // Aquí hacemos la conversión de message a description
      action: options.action,
      duration: options.duration || 5000
    });
  };

  const error = (message: string) => {  // Cambiado el parámetro a message
    return showToast({
      message
    });
  };

  const success = (message: string) => {  // Cambiado el parámetro a message
    return showToast({
      message
    });
  };

  return {
    toast: showToast,
    success,
    error
  };
}

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