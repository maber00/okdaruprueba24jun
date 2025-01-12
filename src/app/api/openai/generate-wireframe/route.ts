// src/app/api/openai/generate-wireframe/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function generateWireframe(description: string) {
  return await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Eres un experto en UX/UI. Tu tarea es analizar la descripción proporcionada y generar una estructura de wireframe detallada.
                 
                 Para cada sección, debes especificar:
                 - Layout y disposición de elementos
                 - Jerarquía de contenido
                 - Componentes UI necesarios
                 - Interacciones sugeridas`
      },
      {
        role: "user",
        content: description
      }
    ],
    max_tokens: 1000,
    temperature: 0.7,
  });
}

export async function POST(request: Request) {
  try {
    const { description } = await request.json();
    const completion = await generateWireframe(description);
    const wireframeStructure = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      wireframe: {
        structure: wireframeStructure,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating wireframe:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { 
      status: 500 
    });
  }
}