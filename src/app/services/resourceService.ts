// src/app/services/resourceService.ts
interface TeamMember {
    id: string;
    name: string;
    role: string;
    skills: string[];
    availability: number; // porcentaje de tiempo disponible
    currentProjects: number;
  }
  
  export const getAvailableTeamMembers = async (projectType: string) => {
    // En un caso real, esto vendría de la base de datos
    const team: TeamMember[] = [
      {
        id: '1',
        name: 'Ana García',
        role: 'designer',
        skills: ['branding', 'ui/ux', 'print'],
        availability: 80,
        currentProjects: 2
      },
      // ... más miembros del equipo
    ];
  
    // Filtramos por tipo de proyecto y disponibilidad
    return team.filter(member => 
      member.availability > 20 && 
      member.skills.some(skill => skill.includes(projectType))
    );
  };