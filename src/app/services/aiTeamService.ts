// src/app/services/aiTeamService.ts
import type { TeamMember } from '@/app/types/auth';
import { openAIService } from '@/app/core/ai/services/openaiService';

class AITeamService {
 async selectDesigner(projectRequirements: any, availableTeam: TeamMember[]) {
   const prompt = `Selecciona el mejor diseñador para este proyecto:
     Requisitos: ${JSON.stringify(projectRequirements)}
     Diseñadores disponibles: ${JSON.stringify(availableTeam)}
     
     Considera:
     - Especialidades
     - Disponibilidad
     - Carga actual de trabajo
     - Experiencia previa similar`;

   const response = await openAIService.generateChatCompletion([{
     role: 'system',
     content: prompt
   }]);

   // Parsea la respuesta y selecciona el diseñador
   const selectedDesignerId = JSON.parse(response || '').selectedDesignerId;
   return availableTeam.find(member => member.id === selectedDesignerId);
 }
}

export const aiTeamService = new AITeamService();