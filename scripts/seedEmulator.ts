// scripts/seedEmulator.ts
import { initializeFirebase } from '../src/app/lib/firebase/init';
import { collection, addDoc } from 'firebase/firestore';

async function seedEmulator() {
  try {
    // Inicializar Firebase usando tu configuración existente
    const { db } = initializeFirebase();

    // Crear colección de tareas de prueba
    const tasks = [
      {
        name: "Diseño de Logo",
        description: "Crear logo para cliente XYZ",
        status: "pending" as const,
        priority: "high" as const,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        assignedTo: ["XgUbPxeLiLeatRfwShAmHxal2HS2"],
        projectId: "project-1",
        createdBy: "XgUbPxeLiLeatRfwShAmHxal2HS2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
        attachments: []
      },
      {
        name: "Diseño Web Homepage",
        description: "Diseñar página de inicio",
        status: "in_progress" as const,
        priority: "medium" as const,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 172800000).toISOString(),
        assignedTo: ["XgUbPxeLiLeatRfwShAmHxal2HS2"],
        projectId: "project-1",
        createdBy: "XgUbPxeLiLeatRfwShAmHxal2HS2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
        attachments: []
      }
    ];

    console.log('Iniciando creación de tareas de prueba...');

    for (const task of tasks) {
      const docRef = await addDoc(collection(db, 'tasks'), task);
      console.log('Tarea creada con ID:', docRef.id);
    }

    console.log('Datos de prueba creados exitosamente');

  } catch (error) {
    console.error('Error al crear datos de prueba:', error);
  }
}

// Ejecutar el script
seedEmulator().then(() => {
  console.log('Script completado');
  process.exit(0);
}).catch(error => {
  console.error('Error en script:', error);
  process.exit(1);
});