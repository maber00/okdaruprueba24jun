import type { Metadata, Viewport } from 'next';
import { AppProviders } from '@/app/shared/components/providers/AppProviders';
import { ToastViewport } from '@/app/shared/components/ui/toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'DARU - Asistente de Gestión Creativa',
  description: 'Plataforma de gestión de proyectos creativos con IA',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AppProviders>
          {children}
          <ToastViewport />
        </AppProviders>
      </body>
    </html>
  );
}