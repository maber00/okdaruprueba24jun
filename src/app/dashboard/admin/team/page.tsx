// src/app/dashboard/admin/team/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { TeamList } from './components/TeamList';
import { teamService } from '@/app/services/teamService';
import Button from '@/app/shared/components/ui/Button';
import type { TeamMember } from '@/app/types/auth';

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, [selectedRole]);

  async function loadTeam() {
    setIsLoading(true);
    try {
      let members;
      if (selectedRole === 'all') {
        members = await teamService.getTeamMembers();
      } else {
        members = await teamService.getTeamByRole(selectedRole);
      }
      setTeam(members);
    } catch (error) {
      console.error('Error loading team:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Equipo</h1>
        <div className="flex gap-2">
          <Button 
            variant={selectedRole === 'all' ? 'primary' : 'outline'}
            onClick={() => setSelectedRole('all')}
          >
            Todos
          </Button>
          <Button 
            variant={selectedRole === 'designer' ? 'primary' : 'outline'}
            onClick={() => setSelectedRole('designer')}
          >
            Diseñadores
          </Button>
          <Button 
            variant={selectedRole === 'client' ? 'primary' : 'outline'}
            onClick={() => setSelectedRole('client')}
          >
            Clientes
          </Button>
        </div>
      </div>

      {team.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No hay miembros en el equipo para mostrar
        </div>
      ) : (
        <TeamList team={team} onSelect={() => {}} />
      )}
    </div>
  );
}