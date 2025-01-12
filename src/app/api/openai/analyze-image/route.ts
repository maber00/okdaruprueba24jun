// src/app/api/openai/analyze-image/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    throw new Error('Failed to fetch image from URL');
  }
}

async function analyzeImage(base64Url: string) {
  return await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "system",
        content: `Como DARU, analiza esta imagen de referencia considerando los siguientes aspectos:
                 
                 1. PALETA DE COLORES
                 - Colores principales y secundarios
                 - Psicología y significado de los colores
                 - Contraste y armonía

                 2. COMPOSICIÓN Y LAYOUT
                 - Estructura y jerarquía visual
                 - Balance y distribución de elementos
                 - Uso del espacio

                 3. ELEMENTOS VISUALES
                 - Tipografías y su uso
                 - Iconografía y símbolos
                 - Imágenes y gráficos

                 4. ESTILO Y TONO
                 - Personalidad de marca
                 - Público objetivo
                 - Mensaje transmitido

                 5. ASPECTOS TÉCNICOS
                 - Calidad y resolución
                 - Adaptabilidad responsive
                 - Accesibilidad

                 Proporciona un análisis detallado y recomendaciones prácticas.`
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analiza esta imagen y proporciona un análisis estructurado:"
          },
          {
            type: "image_url",
            image_url: {
              url: base64Url,
              detail: "high"
            }
          }
        ]
      }
    ],
    max_tokens: 1000,
    temperature: 0.7,
  });
}

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();
    const imageBuffer = await fetchImageAsBuffer(imageUrl);
    const base64Image = imageBuffer.toString('base64');
    const base64Url = `data:image/jpeg;base64,${base64Image}`;

    const completion = await analyzeImage(base64Url);
    const analysis = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      analysis: {
        content: analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { 
      status: 500 
    });
  }
}