// src/app/core/ai/services/analysisService.ts
import type { ProjectAnalysis, TechnicalRequirement } from '@/app/types/project';
import type { BriefData, ProjectType } from '@/app/types/brief';
import openAIService, { type ChatMessage } from './openaiService';

interface AnalysisResponse {
 success: boolean;
 data?: {
   analysis: string;
   suggestions?: string[];
   timestamp: string;
 };
 error?: string;
}

interface ProjectDataForAnalysis {
 id: string;
 title: string;
 description: string;
 type: ProjectType;
 requirements: string[];
 resources?: string[];
}

class AnalysisService {
 async analyzeBrief(
   conversation: ChatMessage[], 
   projectType: ProjectType
 ): Promise<BriefData> {
   try {
     const systemPrompt = {
       role: 'system' as const,
       content: `Como DARU, analiza la conversación y genera un brief detallado para un proyecto de tipo ${projectType}.`
     };

     const messages = [systemPrompt, ...conversation];
     const briefContent = await openAIService.generateChatCompletion(messages);
     return this.parseBriefContent(briefContent || '', projectType);
   } catch (error) {
     console.error('Error en análisis de brief:', error);
     throw error;
   }
 }

 async analyzeImage(imageUrl: string): Promise<AnalysisResponse> {
   try {
     const prompt = `Analiza esta imagen considerando:
       - Paleta de colores y uso del color
       - Composición y layout
       - Elementos visuales clave
       - Estilo y tono visual
       - Tipografía y tratamiento de texto
       - Potenciales aplicaciones`;

     const analysis = await openAIService.analyzeImage(imageUrl, prompt);

     return {
       success: true,
       data: {
         analysis: analysis || '',
         timestamp: new Date().toISOString()
       }
     };
   } catch (error) {
     console.error('Error en análisis de imagen:', error);
     throw error;
   }
 }

 async analyzeProject(data: ProjectDataForAnalysis): Promise<ProjectAnalysis> {
   try {
     const projectDescription = `
       Título: ${data.title}
       Tipo: ${data.type}
       Descripción: ${data.description}
       Requisitos: ${data.requirements.join(', ')}
     `;

     const messages: ChatMessage[] = [
       {
         role: 'system',
         content: 'Como DARU, analiza este proyecto y proporciona recomendaciones detalladas.'
       },
       {
         role: 'user',
         content: projectDescription
       }
     ];

     const analysis = await openAIService.generateChatCompletion(messages);

     // Convertir los requisitos string a TechnicalRequirement
     const requirements: TechnicalRequirement[] = data.requirements.map(req => ({
       type: 'software',
       name: req,
       required: true,
       description: req,
       version: '1.0'
     }));

     return {
       status: 'ready',
       priority: this.determinePriority(data),
       requirements: requirements,
       recommendations: this.parseRecommendations(analysis || ''),
       riskLevel: 'low',
       confidenceScore: 0.8
     };
   } catch (error) {
     console.error('Error en análisis de proyecto:', error);
     throw error;
   }
 }

 private parseBriefContent(content: string, projectType: ProjectType): BriefData {
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
         items: [{ label: "Contenido", value: content }]
       }
     ],
     summary: "Por definir",
     technicalRequirements: "Por definir",
     recommendedProfile: "Por definir",
     estimatedTime: "Por definir"
   };
 }

 private determinePriority(data: ProjectDataForAnalysis): 'high' | 'medium' | 'low' {
   if (data.requirements.length > 10) return 'high';
   if (data.requirements.length > 5) return 'medium';
   return 'low';
 }

 private parseRecommendations(analysis: string): string[] {
   return analysis.split('\n')
     .map(line => line.trim())
     .filter(line => line.length > 0)
     .map(line => line.replace(/^-\s*/, ''));
 }
}

const analysisService = new AnalysisService();
export default analysisService;