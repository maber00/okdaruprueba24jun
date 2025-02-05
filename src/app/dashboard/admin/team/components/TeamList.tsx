// src/app/dashboard/admin/team/components/TeamList.tsx
import { Card } from '@/app/shared/components/ui/card';
import type { TeamMember } from '@/app/types/auth';

interface TeamListProps {
  team: TeamMember[];
  onSelect: (member: TeamMember) => void;
}

export function TeamList({ team, onSelect }: TeamListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {team.map(member => (
        <Card
          key={member.id}
          className="p-4 cursor-pointer hover:shadow-lg"
          onClick={() => onSelect(member)}
        >
          <h3 className="font-medium">{member.displayName}</h3>
          <p className="text-sm text-gray-500">{member.email}</p>
          <div className="mt-2">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {member.role}
            </span>
          </div>
          <div className="mt-2 text-sm">
            <p>Disponibilidad: {member.availability}%</p>
            <p>Proyectos activos: {member.projects?.length || 0}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}