// LoadingSpinner.tsx
export default function LoadingSpinner() {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  