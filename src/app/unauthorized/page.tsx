// src/app/unauthorized/page.tsx
export default function UnauthorizedPage() {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600">Acceso No Autorizado</h1>
          <p className="mt-4 text-gray-600">
            No tienes los permisos necesarios para acceder a esta página.
          </p>
          <a 
            href="/dashboard" 
            className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver al Dashboard
          </a>
        </div>
      </div>
    );
  }