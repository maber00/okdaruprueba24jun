// ErrorMessage.tsx
interface ErrorMessageProps {
    message: string;
    action?: () => void;
    actionText?: string;
  }
  
  export default function ErrorMessage({ 
    message, 
    action, 
    actionText = 'Reintentar' 
  }: ErrorMessageProps) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">{message}</p>
            {action && (
              <button
                onClick={action}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
              >
                {actionText}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }