// src/app/dashboard/admin/team/components/TeamMemberForm.tsx
import { useState } from 'react';
import Input from '@/app/shared/components/ui/Input';
import Button from '@/app/shared/components/ui/Button';
import type { TeamMember, UserRole } from '@/app/types/auth';

interface TeamMemberFormProps {
 member?: TeamMember | null;
 onSubmit: (data: Omit<TeamMember, 'id'>) => Promise<void>;
 onCancel: () => void;
}

export function TeamMemberForm({ member, onSubmit, onCancel }: TeamMemberFormProps) {
 const [formData, setFormData] = useState<Omit<TeamMember, 'id' | 'userId'>>({
   displayName: member?.displayName || '',
   email: member?.email || '',
   role: member?.role || 'designer',
   specialties: member?.specialties || [],
   availability: member?.availability || 100,
   status: member?.status || 'active',
   projects: member?.projects || [] // Agregar proyectos por defecto
 });

 return (
   <form
     onSubmit={async (e) => {
       e.preventDefault();
       await onSubmit({ ...formData, userId: member?.userId || '' });
     }}
     className="space-y-4"
   >
     <Input
       label="Nombre"
       value={formData.displayName}
       onChange={e => setFormData(prev => ({
         ...prev,
         displayName: e.target.value
       }))}
     />

     <Input 
       label="Email"
       type="email"
       value={formData.email}
       onChange={e => setFormData(prev => ({
         ...prev,
         email: e.target.value
       }))}
     />

     <div>
       <label className="block text-sm font-medium">Rol</label>
       <select 
         value={formData.role}
         onChange={e => setFormData(prev => ({
           ...prev,
           role: e.target.value as UserRole
         }))}
         className="mt-1 block w-full rounded-md border-gray-300"
       >
         <option value="designer">Diseñador</option>
         <option value="project_manager">Project Manager</option>
         <option value="client">Cliente</option>
       </select>
     </div>

     <div className="flex justify-end gap-2">
       <Button type="button" variant="outline" onClick={onCancel}>
         Cancelar
       </Button>
       <Button type="submit">
         {member ? 'Actualizar' : 'Crear'} Miembro
       </Button>
     </div>
   </form>
 );
}