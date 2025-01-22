// src/app/dashboard/projects/components/ProjectTeam.tsx
'use client';
import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/app/shared/components/ui/card';
import Button from '@/app/shared/components/ui/Button';
import Avatar from '@/app/shared/components/ui/Avatar';
import { 
  UserPlus, 
  Settings,
  Trash,
  Mail,
  UserCog,
  X
} from 'lucide-react';
import { projectService } from '@/app/services/projectService';
import { useToast } from '@/app/shared/hooks/useToast';
import type { ProjectMember } from '@/app/types/project';

interface ProjectTeamProps {
  team: ProjectMember[];
  projectId: string;
  canManageTeam: boolean;
}

interface AddMemberModal {
  isOpen: boolean;
  email: string;
  role: ProjectMember['role'];
}

const ROLE_LABELS: Record<ProjectMember['role'], string> = {
    project_manager: 'Project Manager',
    designer: 'Diseñador',
    client: 'Cliente'
  };
  
  const ROLE_ICONS: Record<ProjectMember['role'], React.ReactNode> = {
    project_manager: <UserCog className="h-4 w-4 text-blue-500" />,
    designer: <UserPlus className="h-4 w-4 text-green-500" />,
    client: <Mail className="h-4 w-4 text-gray-500" />
  };
  
  

export function ProjectTeam({ team, projectId, canManageTeam }: ProjectTeamProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [addMemberModal, setAddMemberModal] = useState<AddMemberModal>({
    isOpen: false,
    email: '',
    role: 'designer'
  });

  const handleAddMember = async (email: string, role: ProjectMember['role']) => {
    if (!email || !role) {
      toast({
        message: 'Por favor completa todos los campos'
      });
      return;
    }

    try {
      setIsLoading(true);
      await projectService.addTeamMember(projectId, email, role, []);

      toast({
        message: 'Miembro agregado exitosamente'
      });
      setAddMemberModal(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        message: 'Error al agregar miembro'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await projectService.removeTeamMember(projectId, memberId);
      
      toast({
        message: 'Miembro removido exitosamente'
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        message: 'Error al remover miembro'
      });
    }
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Equipo del Proyecto</h3>
          <p className="text-sm text-gray-500">{team.length} miembros</p>
        </div>
        {canManageTeam && (
          <Button
            onClick={() => setAddMemberModal(prev => ({ ...prev, isOpen: true }))}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Agregar Miembro
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Lista de Miembros */}
          {team.map((member) => (
            <div 
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Avatar
                  alt={`Team member ${member.id}`}
                  size={40}
                />
                <div>
                  <p className="font-medium">{member.userId}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {ROLE_ICONS[member.role]}
                    <span className="text-sm text-gray-600">
                      {ROLE_LABELS[member.role]}
                    </span>
                  </div>
                </div>
              </div>

              {canManageTeam && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {}}
                    className="p-2 hover:bg-gray-200 rounded-full"
                  >
                    <Settings className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 hover:bg-red-100 rounded-full"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {team.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay miembros en el equipo
            </div>
          )}
        </div>

        {/* Modal para agregar miembro */}
        {addMemberModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Agregar Miembro</h3>
                <button
                  onClick={() => setAddMemberModal(prev => ({ ...prev, isOpen: false }))}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={addMemberModal.email}
                    onChange={(e) => setAddMemberModal(prev => ({ 
                      ...prev, 
                      email: e.target.value 
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rol
                  </label>
                  <select
                    value={addMemberModal.role}
                    onChange={(e) => setAddMemberModal(prev => ({ 
                      ...prev, 
                      role: e.target.value as ProjectMember['role']
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setAddMemberModal(prev => ({ ...prev, isOpen: false }))}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleAddMember(addMemberModal.email, addMemberModal.role)}
                    isLoading={isLoading}
                  >
                    Agregar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}