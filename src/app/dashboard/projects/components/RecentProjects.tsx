// RecentProjects.tsx
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/app/shared/components/ui/card';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import type { Project } from '@/app/types/project';
import Link from 'next/link';

interface RecentProjectsProps {
  className?: string;
}

export default function RecentProjects({ className }: RecentProjectsProps) {
    const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          dueDate: data.dueDate.toDate()
        } as Project;
      });
      setProjects(projectData);
    });

    return () => unsubscribe();
  }, []);

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="border-b pb-4">
        <h2 className="text-lg font-semibold">Proyectos Recientes</h2>
      </CardHeader>
      <CardContent className="divide-y">
        {projects.map((project) => (
          <Link 
            key={project.id}
            href={`/dashboard/projects/${project.id}`}
            className="block py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(project.status)}
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  <p className="text-sm text-gray-500">
                    {project.type}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
              Vence: {new Date(project.dueDate).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No hay proyectos recientes
          </div>
        )}
      </CardContent>
    </Card>
  );
}