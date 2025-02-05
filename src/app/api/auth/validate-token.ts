import { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from '@/app/lib/firebase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permite el método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { token } = req.body;

  // Verifica si el token está presente en el cuerpo de la solicitud
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // Valida el token utilizando Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Extrae información relevante del token
    const { uid, role } = decodedToken;

    // Devuelve una respuesta exitosa con el UID y el rol
    return res.status(200).json({
      uid,
      role,
    });
  } catch (error) {
    console.error('Error validating token:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
