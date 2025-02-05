// src/services/aiTimelineService.ts
import { OpenAI } from 'openai';
import type { ProjectTimeline } from '@/app/types/planning';
import type { BriefData } from '@/app/types/brief';

class AITimelineService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateTimelineFromBrief(brief: BriefData): Promise<ProjectTimeline> {
    try {
      const prompt = this.createTimelinePrompt(brief);
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Eres un experto Project Manager que genera líneas de tiempo detalladas para proyectos."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const response = completion.choices[0].message.content;
      return this.parseTimelineResponse(response || '', brief);
    } catch (error) {
      console.error('Error generating timeline:', error);
      throw error;
    }
  }

  private createTimelinePrompt(brief: BriefData): string {
    return `Analiza el siguiente brief de proyecto y genera una línea de tiempo 
    detallada con milestones y checklist:

    Proyecto: ${brief.title}
    Tipo: ${brief.projectType}
    Objetivo: ${brief.objective}
    Requerimientos: ${brief.technicalRequirements}
    
    Genera una estructura con:
    1. Milestones principales
    2. Fechas estimadas
    3. Dependencias entre tareas
    4. Puntos de revisión
    5. Entregables específicos
    
    Formato esperado:
    {
      "milestones": [
        {
          "title": "string",
          "description": "string",
          "dueDate": "ISO date",
          "dependencies": ["id"],
          "deliverables": ["string"]
        }
      ]
    }`;
  }

  private parseTimelineResponse(response: string, brief: BriefData): ProjectTimeline {
    try {
      const parsedResponse = JSON.parse(response);
      
      // Convertir fechas string a objetos Date
      const milestones = parsedResponse.milestones.map((milestone: any) => ({
        ...milestone,
        id: crypto.randomUUID(),
        dueDate: new Date(milestone.dueDate)
      }));

      return {
        id: crypto.randomUUID(),
        projectId: brief.projectId,
        startDate: new Date(),
        endDate: this.calculateEndDate(milestones),
        milestones,
        status: 'active',
        progress: 0,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Retornar timeline por defecto si falla el parsing
      return this.getDefaultTimeline(brief);
    }
  }

  private calculateEndDate(milestones: any[]): Date {
    if (milestones.length === 0) {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días por defecto
    }
    
    return new Date(Math.max(
      ...milestones.map(m => new Date(m.dueDate).getTime())
    ));
  }

  private getDefaultTimeline(brief: BriefData): ProjectTimeline {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return {
      id: crypto.randomUUID(),
      projectId: brief.projectId,
      startDate,
      endDate,
      milestones: [
        {
          id: crypto.randomUUID(),
          title: 'Inicio del Proyecto',
          description: 'Kickoff y planificación inicial',
          dueDate: startDate,
          dependencies: []
        },
        {
          id: crypto.randomUUID(),
          title: 'Entrega Final',
          description: 'Entrega y cierre del proyecto',
          dueDate: endDate,
          dependencies: []
        }
      ],
      status: 'active',
      progress: 0,
      lastUpdated: new Date()
    };
  }
}

export const aiTimelineService = new AITimelineService();