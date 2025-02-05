// src/app/shared/components/providers/AppProviders.tsx
import { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { ToastProvider } from '@/app/shared/components/ui/toast'
import { AuthProvider } from '@/app/core/auth/context/AuthContext'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}