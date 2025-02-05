// src/app/api/verify-session/route.ts
import { NextResponse } from 'next/server'
import { adminAuth } from '@/app/lib/firebase/admin'
import { authLogger } from '@/app/lib/logger'
import { db } from '@/app/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 400 }
      )
    }

    try {
      // Verificar token con Firebase Admin
      const decodedToken = await adminAuth.verifyIdToken(token)
      
      // Verificar si el token no está expirado
      const tokenExp = decodedToken.exp * 1000 // Convertir a milisegundos
      if (Date.now() >= tokenExp) {
        authLogger.warn('verify-session', 'Token expired', { uid: decodedToken.uid })
        return NextResponse.json(
          { error: 'Token expirado' },
          { status: 401 }
        )
      }

      // Obtener información adicional del usuario
      const userDoc = await getDoc(doc(db, 'users', decodedToken.uid))
      
      if (!userDoc.exists()) {
        authLogger.warn('verify-session', 'User document not found', { uid: decodedToken.uid })
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        )
      }

      const userData = userDoc.data()

      authLogger.info('verify-session', 'Session verified successfully', {
        uid: decodedToken.uid,
        role: userData.role
      })

      return NextResponse.json({
        uid: decodedToken.uid,
        role: userData.role,
        permissions: userData.permissions || [],
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      })

    } catch (verifyError) {
      authLogger.error('verify-session', 'Error verifying token', verifyError)
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

  } catch (error) {
    authLogger.error('verify-session', 'Server error', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}