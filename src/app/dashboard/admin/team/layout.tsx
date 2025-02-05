// src/app/dashboard/admin/team/layout.tsx
import Sidebar from '@/app/shared/components/layout/Sidebar';
import Header from '@/app/shared/components/layout/Header';

export default function TeamLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
   <div className="min-h-screen bg-gray-50">
     <Sidebar />
     <div className="ml-64 flex flex-col">
       <Header />
       <main className="flex-1 p-6">
         {children}
       </main>
     </div>
   </div>
 );
}