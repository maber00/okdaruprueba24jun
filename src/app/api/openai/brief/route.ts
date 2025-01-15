// src/app/api/openai/brief/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { BriefData, ProjectType } from '@/app/types/brief';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface BriefSection {
  title: string;
  required: boolean;
  points: string[];
}

interface BriefTemplate {
  sections: BriefSection[];
}

type BriefTemplates = Record<ProjectType, BriefTemplate>;

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

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
        required: true,
        points: [
          "Demografía",
          "Psicografía",
          "Hábitos de consumo",
          "Necesidades y puntos de dolor",
          "Comportamiento de compra"
        ]
      },
      {
        title: "Especificaciones Técnicas",
        required: true,
        points: [
          "Dimensiones y formatos",
          "Plataformas o medios",
          "Restricciones técnicas",
          "Requisitos de impresión/digital",
          "Adaptaciones necesarias"
        ]
      }
    ]
  },
  video: {
    sections: [
      {
        title: "Descripción del Video",
        required: true,
        points: [
          "Tipo de video",
          "Duración estimada",
          "Objetivo del video",
          "Mensaje principal"
        ]
      }
    ]
  },
  animation: {
    sections: [
      {
        title: "Descripción de la Animación",
        required: true,
        points: [
          "Tipo de animación",
          "Duración",
          "Estilo visual",
          "Requisitos técnicos"
        ]
      }
    ]
  },
  web: {
    sections: [
      {
        title: "Descripción del Proyecto Web",
        required: true,
        points: [
          "Tipo de sitio web",
          "Funcionalidades principales",
          "Tecnologías requeridas",
          "Integraciones necesarias"
        ]
      }
    ]
  }
};

function parseBriefContent(content: string, projectType: ProjectType): BriefData {
  // Implementación de parseo del contenido
  return {
    projectType,
    title: "Nuevo Proyecto",
    objective: content.substring(0, 100),
    targetAudience: "Por definir",
    tone: "Profesional",
    brandValues: "Por definir",
    concept: "Por definir",
    keyMessage: "Por definir",
    callToAction: "Por definir",
    platforms: "Por definir",
    sections: [
      {
        title: "Descripción",
        items: [
          {
            label: "Contenido",
            value: content
          }
        ]
      }
    ],
    summary: "Por definir",
    technicalRequirements: "Por definir",
    recommendedProfile: "Por definir",
    estimatedTime: "Por definir"
  };
}

async function generateBrief(
  conversation: ConversationMessage[],
  projectType: ProjectType
): Promise<BriefData> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Eres DARU, un Product Manager IA especializado en proyectos creativos.
          Tu tarea es analizar la conversación y generar un brief detallado según el template proporcionado.
          
          Utiliza el siguiente template para ${projectType}:
          ${JSON.stringify(BRIEF_TEMPLATES[projectType], null, 2)}
          
          Genera un brief estructurado y completo basado en la conversación.`
        },
        ...conversation
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const briefContent = completion.choices[0].message.content || '';
    return parseBriefContent(briefContent, projectType);

  } catch (error) {
    console.error('Error generating brief:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { conversation, projectType } = await request.json();

    if (!conversation || !projectType) {
      return NextResponse.json({
        success: false,
        error: "Missing required parameters"
      }, { status: 400 });
    }

    if (!BRIEF_TEMPLATES[projectType as ProjectType]) {
      return NextResponse.json({
        success: false,
        error: "Invalid project type"
      }, { status: 400 });
    }

    const briefData = await generateBrief(conversation, projectType as ProjectType);

    return NextResponse.json({
      success: true,
      data: briefData
    });

  } catch (error) {
    console.error('Error in brief generation:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { 
      status: 500 
    });
  }
}