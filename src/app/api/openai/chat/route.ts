// src/app/api/openai/chat/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface ImageReference {
  url: string;
  fileName: string;
  analysis?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  references?: ImageReference[];
}
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function urlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    // Convertir buffer a base64
    const base64 = Buffer.from(buffer).toString('base64');
    // Obtener el tipo MIME de la respuesta
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    // Retornar en formato data URL
    return `data:${contentType};base64,${base64}`;
  }
  

// Tipo para project type

type ProjectType = 'design' | 'animation' | 'video' | 'web';

interface BriefSection {
  title: string;
  required: boolean;
  points: string[];
}

interface BriefTemplate {
  sections: BriefSection[];
}

type BriefTemplates = Record<ProjectType, BriefTemplate>;

const BRIEF_TEMPLATES: BriefTemplates = {

  design: {
    sections: [
      {
        title: "Descripción del Proyecto",
        required: true,
        points: [
          "Tipo de proyecto (identidad corporativa, packaging, web, etc.)",
          "Objetivos específicos del diseño",
          "Resultados esperados",
          "Entregables requeridos",
          "Formatos necesarios"
        ]
      },
      {
        title: "Público Objetivo",
        required: false,
        points: [
          "Demografía",
          "Psicografía",
          "Hábitos de consumo",
          "Necesidades y puntos de dolor",
          "Comportamiento de compra"
        ]
      },
      {
        title: "Competencia",
        required: false,
        points: [
          "Principales competidores directos e indirectos",
          "Análisis de diseños de la competencia",
          "Elementos diferenciadores deseados",
          "Posicionamiento buscado frente a la competencia"
        ]
      },
      {
        title: "Especificaciones Técnicas",
        required: true,
        points: [
          "Dimensiones y formatos requeridos",
          "Plataformas o medios de implementación",
          "Restricciones técnicas",
          "Requisitos de impresión o digital",
          "Adaptaciones necesarias"
        ]
      },
      {
        title: "Elementos de Marca",
        required: true,
        points: [
          "Paleta de colores (existente o preferencias)",
          "Tipografías permitidas",
          "Elementos gráficos existentes",
          "Guía de estilo (si existe)",
          "Tono y personalidad de marca"
        ]
      },
      {
        title: "Referencias y Preferencias",
        required: false,
        points: [
          "Ejemplos de diseños admirados",
          "Estilos visuales preferidos",
          "Elementos a evitar",
          "Trabajos anteriores relevantes",
          "Tendencias de interés"
        ]
      }
    ]
  },
  video: {
    sections: [
      {
        title: "Información Básica del Proyecto",
        required: true,
        points: [
          "Título del video",
          "Duración estimada",
          "Propósito principal",
          "Mensaje clave a comunicar",
          "Canales de distribución"
        ]
      },
      {
        title: "Detalles de Producción",
        required: true,
        points: [
          "Tipo de video (comercial, corporativo, documental, etc.)",
          "Estilo visual deseado",
          "Requisitos de filmación (locación, estudio)",
          "Necesidad de talento (actores, voces)",
          "Elementos gráficos necesarios"
        ]
      },
      {
        title: "Contenido",
        required: true,
        points: [
          "Guion",
          "Música y efectos sonoros",
          "Voz en off",
          "Subtítulos/textos en pantalla"
        ]
      },
      {
        title: "Aspectos Técnicos",
        required: true,
        points: [
          "Resolución requerida",
          "Formato de entrega",
          "Requisitos de color",
          "Especificaciones de audio",
          "Versiones necesarias"
        ]
      }
    ]
  },
  animation: {
    sections: [
      {
        title: "Concepto General",
        required: true,
        points: [
          "Tipo de animación (2D, 3D, motion graphics)",
          "Duración del proyecto",
          "Objetivo de la animación",
          "Referencias visuales",
          "Estilo artístico deseado"
        ]
      },
      {
        title: "Elementos Técnicos",
        required: true,
        points: [
          "Software requerido",
          "Resolución y framerate",
          "Formatos de entrega",
          "Requisitos de renderizado"
        ]
      },
      {
        title: "Contenido Creativo",
        required: true,
        points: [
          "Guión",
          "Paleta de colores",
          "Transiciones deseadas",
          "Efectos especiales necesarios"
        ]
      },
      {
        title: "Audio",
        required: true,
        points: [
          "Música de fondo",
          "Efectos sonoros",
          "Voces y diálogos",
          "Sincronización requerida",
          "Mezcla de audio final"
        ]
      }
    ]
  },
  web: {
    sections: [
      {
        title: "Información General",
        required: true,
        points: [
          "Objetivo del sitio web",
          "Público objetivo",
          "Competidores principales",
          "Propuesta única de valor",
          "Dominio y hosting (si ya existen)"
        ]
      },
      {
        title: "Arquitectura del Sitio",
        required: true,
        points: [
          "Mapa del sitio",
          "Páginas principales",
          "Funcionalidades requeridas",
          "Sistemas de navegación",
          "Jerarquía de contenido"
        ]
      },
      {
        title: "Diseño y UX",
        required: true,
        points: [
          "Estilo visual deseado",
          "Paleta de colores",
          "Tipografías",
          "Referencias de diseño",
          "Experiencia de usuario deseada"
        ]
      },
      {
        title: "Contenido",
        required: true,
        points: [
          "Textos principales",
          "Imágenes/multimedia",
          "Llamadas a la acción",
          "Formularios necesarios",
          "Blog o noticias"
        ]
      },
      {
        title: "Aspectos Técnicos",
        required: true,
        points: [
          "Plataforma preferida (WordPress, etc.)",
          "Requisitos de responsive design",
          "Integración con redes sociales",
          "SEO básico requerido",
          "Analytics y seguimiento"
        ]
      },
      {
        title: "Mantenimiento",
        required: true,
        points: [
          "Plan de actualización",
          "Gestión de contenido",
          "Backup y seguridad",
          "Soporte post-lanzamiento",
          "Capacitación necesaria"
        ]
      }
    ]
  }
};


// Función de reintento
const retryOperation = async <T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
};

export async function POST(request: Request) {
    try {
      const { messages, projectType } = await request.json();
  
      console.log('Processing messages with images...');
  
      const processedMessages = await Promise.all(messages.map(async (msg: ChatMessage) => {
        if (msg.references && msg.references.length > 0) {
          try {
            const imageContents = await Promise.all(msg.references.map(async (ref: ImageReference) => {
              const base64Image = await urlToBase64(ref.url);
              return {
                type: "image_url",
                image_url: { 
                  url: base64Image,
                  detail: "high"
                }
              };
            }));
        
            return {
              role: msg.role,
              content: [
                { 
                  type: "text", 
                  text: "Por favor, analiza esta imagen según los criterios establecidos (paleta de colores, tipografía, composición, elementos visuales y especificaciones técnicas):"
                },
                ...imageContents
              ]
            };
          } catch (error) {
            console.error('Error processing images:', error);
            throw new Error('Error processing images');
          }
        }        
        return {
          role: msg.role,
          content: msg.content
        };
      }));
      const systemMessage = {
        role: "system",
        content: `Eres DARU, un Product Manager IA especializado en proyectos creativos.
      
          PROCESO DE RECOPILACIÓN:
          1. Comienza preguntando el tipo de proyecto (diseño/video/animación/web)
          2. Realiza preguntas específicas según el tipo de proyecto
          3. Analiza las imágenes de referencia si se proporcionan
          4. Confirma información antes de avanzar
      
          Al hacer preguntas, usa este formato con espaciado:
      
         ### Preguntas del Brief\n\n

    1. **Objetivo principal**:
       ¿[Pregunta sobre objetivo]?\n\n

    2. **Público objetivo**:
       ¿[Pregunta sobre público]?\n\n

    3. **Tono de comunicación**:
       ¿[Pregunta sobre tono]?\n\n

    4. **Valores de marca**:
       ¿[Pregunta sobre valores]?\n\n

    5. **Mensaje clave**:
       ¿[Pregunta sobre mensaje]?\n\n"

    ANÁLISIS DE IMÁGENES:
    Cuando analices imágenes, usa este formato:

    "### Análisis de la Imagen\n\n

    **Paleta de Colores**:\n
    - **Colores Principales**:\n
      - [Color 1] (#código-hex)\n
      - [Color 2] (#código-hex)\n\n
      
          - **Proporción de Uso**:\n
            - [Descripción detallada del uso de cada color]\n\n"
            - [Importancia y balance de los colores]\n\n"
            - [Aplicaciones recomendadas]\n\n"
      
          - **Combinaciones Recomendadas**:\n
            - [Descripción de combinaciones sugeridas]\n\n"
            - [Contextos de uso]\n\n"
      
          **Tipografía**:\n
          - **Familia Tipográfica**:\n
            - [Detalles de tipografías principales]\n\n"
            - [Tipografías secundarias]\n\n"
            - [Justificación de elección]\n\n"
          - **Jerarquía de Textos**:
            - [Explicación detallada de la jerarquía]\n\n"
            - [Tamaños y pesos recomendados]\n\n"
      
          **Composición**:\n
          - **Estructura y Layout**:\n
            - [Descripción detallada de la estructura]\n\n"
            - [Principios de composición aplicados]\n\n"
          - **Puntos Focales**:
            - [Identificación de elementos clave]\n\n"
            - [Flujo visual]\n\n"
            - [Balance y peso visual]\n\n"
      
          **Elementos Visuales**:\n
          - **Iconografía**:\n
            - [Descripción detallada de iconos]\n\n"
            - [Estilo y consistencia]\n\n"
          - **Fotografías/Ilustraciones**:
            - [Análisis detallado de elementos visuales]\n\n"
            - [Tratamiento y estilo]\n\n"
      
          **Especificaciones Técnicas**:\n
          - **Formatos Necesarios**:\n
            - [Detalles técnicos específicos]\n\n"
            - [Requerimientos de exportación]\n\n"
          - **Resoluciones Requeridas**:
            - [Especificaciones detalladas de resolución]\n\n"
            - [Adaptaciones necesarias]\n\n"
          
          CUANDO COMPLETES LA RECOPILACIÓN:
          Responde con BRIEF_COMPLETADO| seguido del JSON sin saltos de línea:
      
          BRIEF_COMPLETADO|{"projectType":"tipo_de_proyecto","title":"título del proyecto","objective":"objetivo principal","targetAudience":"público objetivo","tone":"tono de comunicación","brandValues":"valores de marca","concept":"concepto creativo","keyMessage":"mensaje clave","callToAction":"llamada a la acción","platforms":"plataformas","sections":[{"title":"Análisis Visual","items":[{"label":"Paleta de Colores","value":"códigos hex y descripción de uso"},{"label":"Tipografía","value":"fuentes y jerarquía"},{"label":"Elementos Visuales","value":"descripción de elementos clave"},{"label":"Composición","value":"estructura y layout"}]}],"summary":"resumen del proyecto","technicalRequirements":"requisitos técnicos","priority":"prioridad del proyecto","estimatedTime":"tiempo estimado"}
      
          IMPORTANTE:
          - Mantén todo el detalle y profundidad en el análisis
          - El JSON debe ir en una sola línea después de BRIEF_COMPLETADO|
          - No agregues caracteres especiales ni formato adicional al JSON
      
          ESTRUCTURA DEL BRIEF:
          ${projectType && projectType in BRIEF_TEMPLATES ? 
            JSON.stringify(BRIEF_TEMPLATES[projectType as keyof BriefTemplates], null, 2) : 
            'Por favor especifica el tipo de proyecto primero'
          }`
      };
console.log('Sending request to OpenAI...', {
  model: 'gpt-4o',  // Cambiado de 'gpt-4o' a 'gpt-4'
  messagesCount: processedMessages.length,
  hasImages: processedMessages.some((msg: ChatMessage) => Array.isArray(msg.content))
});

const completion = await retryOperation(() =>
  openai.chat.completions.create({
    model: "gpt-4o",  // Cambiado de 'gpt-4o' a 'gpt-4'
    messages: [systemMessage, ...processedMessages],
    temperature: 0.7,
    max_tokens: 500  // Aumentado para permitir respuestas más largas
  })
);  

console.log('Received response from OpenAI');

return NextResponse.json({
  success: true,
  content: completion.choices[0].message.content
});

} catch (error) {
console.error('OpenAI API Error:', error);
let errorMessage = 'Error desconocido';
let statusCode = 500;

if (error instanceof OpenAI.APIError) {
  errorMessage = error.message;
  statusCode = error.status || 500;
  console.error('OpenAI API Details:', {
    status: error.status,
    code: error.code,
    type: error.type
  });
}

return NextResponse.json({
  success: false,
  error: errorMessage
}, {
  status: statusCode
});
}
}