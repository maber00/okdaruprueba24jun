import type { BriefData } from '@/app/types/brief';
import type { AIAnalysis } from '@/app/types/project';
import type { 
  ResourceEstimates, 
  TimelineEstimate, 
  BudgetEstimate 
} from '@/app/types/estimation';

export class EstimationService {
  // Tasas base en COP
  private readonly BASE_DAILY_RATE = 300000; // Tasa base diaria por persona
  private readonly OPERATIONAL_COST_FACTOR = 0.3; // 30% adicional para costos operativos
  private readonly CURRENCY = 'COP';

  async estimateResources(
    brief: BriefData,
    analysis: AIAnalysis
  ): Promise<ResourceEstimates> {
    try {
      const teamSize = this.calculateTeamSize(brief, analysis);
      const duration = this.estimateDuration(brief, analysis);
      const baseBudget = this.calculateBaseBudget(teamSize, duration);

      return {
        team: this.generateTeamStructure(teamSize, brief.projectType),
        timeline: this.generateInitialTimeline(duration),
        budget: this.generateBudgetBreakdown(baseBudget)
      };
    } catch (error) {
      console.error('Error en estimación de recursos:', error);
      throw error;
    }
  }

  private calculateTeamSize(brief: BriefData, analysis: AIAnalysis): number {
    // Base mínima de 2 personas, máximo 5 para proyectos complejos
    const baseSize = Math.max(2, Math.ceil(analysis.complexity === 'high' ? 5 : 3));
    
    // Ajuste por tipo de proyecto
    const typeFactors: Record<string, number> = {
      design: 1,
      video: 1.2,
      animation: 1.3,
      web_design: 1.2,
      web_development: 1.5
    };
    
    return Math.ceil(baseSize * (typeFactors[brief.projectType] || 1));
  }

  private estimateDuration(brief: BriefData, analysis: AIAnalysis): number {
    // Duración base en días según tipo de proyecto
    const baseDurations: Record<string, number> = {
      design: 10,
      video: 15,
      animation: 20,
      web_design: 15,
      web_development: 25
    };

    const baseDuration = baseDurations[brief.projectType] || 14;
    const complexityFactor = analysis.complexity === 'high' ? 2 : 
                           analysis.complexity === 'medium' ? 1.5 : 1;
    
    return Math.ceil(baseDuration * complexityFactor);
  }

  private calculateBaseBudget(teamSize: number, duration: number): number {
    // Cálculo del presupuesto base
    const baseTeamCost = teamSize * duration * this.BASE_DAILY_RATE;
    const operationalCost = baseTeamCost * this.OPERATIONAL_COST_FACTOR;
    
    return Math.ceil(baseTeamCost + operationalCost);
  }

  private generateTeamStructure(teamSize: number, projectType: string) {
    const teamStructure = [];
    const roles = this.getRolesByProjectType(projectType);
    
    // Asignar roles basados en el tipo de proyecto
    for (let i = 0; i < teamSize; i++) {
      teamStructure.push({
        role: roles[i % roles.length],
        seniority: i === 0 ? 'senior' : 'mid',
        allocation: 100 // porcentaje de dedicación
      });
    }
    
    return teamStructure;
  }

  private getRolesByProjectType(projectType: string): string[] {
    const roleMap: Record<string, string[]> = {
      design: ['designer', 'art_director'],
      video: ['videographer', 'editor', 'producer'],
      animation: ['animator', 'illustrator', 'art_director'],
      web_design: ['ui_designer', 'ux_designer'],
      web_development: ['frontend_dev', 'backend_dev', 'tech_lead']
    };
    
    return roleMap[projectType] || ['designer'];
  }

  private generateInitialTimeline(duration: number): TimelineEstimate {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
    
    return {
      startDate,
      endDate,
      milestones: this.generateDefaultMilestones(startDate, duration),
      criticalPath: []
    };
  }

  private generateDefaultMilestones(startDate: Date, duration: number) {
    const milestones = [
      {
        id: 'milestone-1',
        title: 'Inicio del Proyecto',
        description: 'Kickoff y planificación inicial',
        dueDate: startDate,
        dependencies: []
      },
      {
        id: 'milestone-2',
        title: 'Entrega Parcial',
        description: 'Primera revisión de avances',
        dueDate: new Date(startDate.getTime() + (duration * 0.5) * 24 * 60 * 60 * 1000),
        dependencies: ['milestone-1']
      },
      {
        id: 'milestone-3',
        title: 'Entrega Final',
        description: 'Entrega y cierre del proyecto',
        dueDate: new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000),
        dependencies: ['milestone-2']
      }
    ];
    
    return milestones;
  }

  private generateBudgetBreakdown(total: number): BudgetEstimate {
    const teamCost = total / (1 + this.OPERATIONAL_COST_FACTOR);
    const operationalCost = total - teamCost;
    
    return {
      total,
      breakdown: [
        {
          category: 'Equipo',
          amount: Math.ceil(teamCost),
          description: 'Costos de personal y equipo creativo'
        },
        {
          category: 'Operacional',
          amount: Math.ceil(operationalCost),
          description: 'Costos operativos y gastos generales'
        }
      ],
      currency: this.CURRENCY
    };
  }
}

export const estimationService = new EstimationService();