// src/app/shared/utils/toastService.ts
import { ToastActionElement } from "../components/ui/toast/toast";

export const ToastService = {
  create: (options: { message: string; action?: ToastActionElement; duration?: number }) => {
    console.log("Toast creado:", options);
    return "toast-id"; // Devuelve un ID ficticio para el toast
  },
  dismiss: (toastId: string) => {
    console.log("Toast eliminado:", toastId);
  },
};
