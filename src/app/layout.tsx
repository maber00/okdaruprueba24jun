// src/app/layout.tsx
import type { Metadata } from 'next';
import { AuthProvider } from '@/app/core/auth/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Daru App',
  description: 'Sistema de gestión de pedidos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}