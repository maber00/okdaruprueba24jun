// src/app/dashboard/components/CreateProjectButton.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import Button from '@/app/shared/components/ui/Button';
import { useToast } from '@/app/shared/hooks/useToast';

export default function CreateProjectButton() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateProject = async () => {
    if (!user) {
      toast({
        message: 'Debes iniciar sesión para crear un proyecto'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      router.push('/dashboard/projects/create');
    } catch (error) {
      console.error('Error al iniciar creación de proyecto:', error);
      toast({
        message: 'Error al iniciar la creación del proyecto'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateProject}
      isLoading={isLoading}
      className="bg-blue-600 text-white hover:bg-blue-700"
    >
      <Plus className="w-4 h-4 mr-2" />
      Nuevo Proyecto
    </Button>
  );
}