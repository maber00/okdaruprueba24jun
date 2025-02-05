import type { ProjectType } from '@/app/types/project';
import type { BriefData } from '@/app/types/brief';
import type { ProjectTemplate, Milestone } from '@/app/types/estimation';

class ProjectTemplateService {
  // Plantillas predefinidas por tipo de proyecto
  private readonly templates: Record<ProjectType, ProjectTemplate> = {
    design: {
      id: 'template-design',
      type: 'design',
      defaultSteps: [
        'Brief y requisitos',
        'Investigación',
        'Conceptualización',
        'Diseño preliminar',
        'Revisión del cliente',
        'Ajustes',
        'Entrega final'
      ],
      requiredRoles: ['designer', 'art_director'],
      defaultMilestones: this.getDefaultMilestones('design'),
      estimatedDuration: 10,
      defaultBudget: {
        total: 3000000,
        breakdown: [
          { category: 'Diseño', amount: 2000000, description: 'Diseño creativo y desarrollo' },
          { category: 'Gestión', amount: 1000000, description: 'Gestión de proyecto y revisiones' }
        ],
        currency: 'COP'
      }
    },
    video: {
      id: 'template-video',
      type: 'video',
      defaultSteps: [
        'Brief y guión',
        'Pre-producción',
        'Producción',
        'Post-producción',
        'Revisión del cliente',
        'Ajustes finales',
        'Entrega'
      ],
      requiredRoles: ['videographer', 'editor', 'producer'],
      defaultMilestones: this.getDefaultMilestones('video'),
      estimatedDuration: 15,
      defaultBudget: {
        total: 5000000,
        breakdown: [
          { category: 'Producción', amount: 3000000, description: 'Grabación y equipo' },
          { category: 'Post-producción', amount: 2000000, description: 'Edición y finalización' }
        ],
        currency: 'COP'
      }
    },
    animation: {
      id: 'template-animation',
      type: 'animation',
      defaultSteps: [
        'Brief y conceptualización',
        'Storyboard',
        'Diseño de elementos',
        'Animación',
        'Revisión del cliente',
        'Ajustes',
        'Entrega final'
      ],
      requiredRoles: ['animator', 'illustrator', 'art_director'],
      defaultMilestones: this.getDefaultMilestones('animation'),
      estimatedDuration: 20,
      defaultBudget: {
        total: 4500000,
        breakdown: [
          { category: 'Diseño', amount: 2000000, description: 'Diseño y conceptualización' },
          { category: 'Animación', amount: 2500000, description: 'Animación y producción' }
        ],
        currency: 'COP'
      }
    },
    web_design: {
      id: 'template-web-design',
      type: 'web_design',
      defaultSteps: [
        'Brief y requisitos',
        'UX Research',
        'Wireframes',
        'Diseño UI',
        'Prototipos',
        'Revisión del cliente',
        'Ajustes finales'
      ],
      requiredRoles: ['ui_designer', 'ux_designer'],
      defaultMilestones: this.getDefaultMilestones('web_design'),
      estimatedDuration: 15,
      defaultBudget: {
        total: 4000000,
        breakdown: [
          { category: 'UX/UI', amount: 2500000, description: 'Diseño de interfaz y experiencia' },
          { category: 'Prototipos', amount: 1500000, description: 'Desarrollo de prototipos' }
        ],
        currency: 'COP'
      }
    },
    web_development: {
      id: 'template-web-dev',
      type: 'web_development',
      defaultSteps: [
        'Brief técnico',
        'Arquitectura',
        'Desarrollo Frontend',
        'Desarrollo Backend',
        'Testing',
        'Revisión',
        'Deploy'
      ],
      requiredRoles: ['frontend_dev', 'backend_dev', 'tech_lead'],
      defaultMilestones: this.getDefaultMilestones('web_development'),
      estimatedDuration: 25,
      defaultBudget: {
        total: 8000000,
        breakdown: [
          { category: 'Frontend', amount: 3500000, description: 'Desarrollo frontend' },
          { category: 'Backend', amount: 3500000, description: 'Desarrollo backend' },
          { category: 'DevOps', amount: 1000000, description: 'Infraestructura y deploy' }
        ],
        currency: 'COP'
      }
    }
  };

  private getDefaultMilestones(type: ProjectType): Milestone[] {
    const baseMilestones: Record<ProjectType, Milestone[]> = {
      design: [
        {
          id: 'design-m1',
          title: 'Aprobación de Concepto',
          description: 'Validación de la dirección creativa',
          dueDate: new Date(),
          dependencies: []
        },
        {
          id: 'design-m2',
          title: 'Revisión de Diseños',
          description: 'Revisión de primeras propuestas',
          dueDate: new Date(),
          dependencies: ['design-m1']
        }
      ],
      video: [
        {
          id: 'video-m1',
          title: 'Aprobación de Guión',
          description: 'Validación del guión y plan de rodaje',
          dueDate: new Date(),
          dependencies: []
        },
        {
          id: 'video-m2',
          title: 'Primer Corte',
          description: 'Revisión del primer corte de edición',
          dueDate: new Date(),
          dependencies: ['video-m1']
        }
      ],
      animation: [
        {
          id: 'anim-m1',
          title: 'Aprobación de Storyboard',
          description: 'Validación del storyboard y estilo',
          dueDate: new Date(),
          dependencies: []
        },
        {
          id: 'anim-m2',
          title: 'Revisión de Animación',
          description: 'Revisión de primeras animaciones',
          dueDate: new Date(),
          dependencies: ['anim-m1']
        }
      ],
      web_design: [
        {
          id: 'webdes-m1',
          title: 'Aprobación de Wireframes',
          description: 'Validación de estructura y UX',
          dueDate: new Date(),
          dependencies: []
        }
      ],
      web_development: [
        {
          id: 'webdev-m1',
          title: 'Aprobación de Arquitectura',
          description: 'Validación de la arquitectura técnica',
          dueDate: new Date(),
          dependencies: []
        }
      ]
    };

    return baseMilestones[type];
  }

  async getTemplateForType(type: ProjectType): Promise<ProjectTemplate> {
    try {
      const template = this.templates[type];
      if (!template) {
        throw new Error(`No template found for project type: ${type}`);
      }
      return template;
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  }

  async customizeTemplate(
    template: ProjectTemplate,
    briefData: BriefData
  ): Promise<ProjectTemplate> {
    try {
      const customizedTemplate = {
        ...template,
        estimatedDuration: this.adjustDuration(template.estimatedDuration, briefData),
        defaultBudget: this.adjustBudget(template.defaultBudget, briefData),
        defaultMilestones: this.adjustMilestones(template.defaultMilestones, briefData)
      };

      return customizedTemplate;
    } catch (error) {
      console.error('Error customizing template:', error);
      throw error;
    }
  }

  private adjustDuration(baseDuration: number, brief: BriefData): number {
    let durationFactor = 1;
    
    if (brief.technicalRequirements) {
      durationFactor *= 1 + (brief.technicalRequirements.length * 0.1);
    }

    return Math.ceil(baseDuration * durationFactor);
  }

  private adjustBudget(baseBudget: ProjectTemplate['defaultBudget'], brief: BriefData) {
    let budgetFactor = 1;
    
    if (brief.platforms) {
      const platformCount = brief.platforms.split(',').length;
      budgetFactor *= 1 + (platformCount * 0.15);
    }

    return {
      ...baseBudget,
      total: Math.ceil(baseBudget.total * budgetFactor),
      breakdown: baseBudget.breakdown.map(item => ({
        ...item,
        amount: Math.ceil(item.amount * budgetFactor)
      }))
    };
  }

  private adjustMilestones(baseMilestones: Milestone[], brief: BriefData): Milestone[] {
    return baseMilestones.map(milestone => ({
      ...milestone,
      dueDate: this.calculateMilestoneDueDate(milestone, brief)
    }));
  }

  private calculateMilestoneDueDate(milestone: Milestone, brief: BriefData): Date {
    const today = new Date();
    const estimatedDays = this.adjustDuration(15, brief); // 15 días base
    const daysToAdd = Math.floor(estimatedDays * 0.5); // 50% del tiempo total
    
    return new Date(today.setDate(today.getDate() + daysToAdd));
  }
}

export const projectTemplateService = new ProjectTemplateService();