// src/app/components/layout/Header.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '@/app/core/auth/hooks/useAuth';
import { auth } from '@/app/lib/firebase';

export default function Header() {
 const router = useRouter();
 const { user } = useAuth();
 const [isProfileOpen, setIsProfileOpen] = useState(false);

 const handleLogout = async () => {
   try {
     await auth.signOut();
     router.push('/auth/login');
   } catch (error) {
     console.error('Error al cerrar sesión:', error);
   }
 };

 return (
   <header className="bg-white border-b border-gray-200 h-16">
     <div className="flex items-center justify-between h-full px-6">
       {/* Buscador */}
       <div className="flex-1 max-w-lg">
         <div className="relative">
           <div className="absolute inset-y-0 left-0 flex items-center pl-3">
             <Search className="h-5 w-5 text-gray-400" />
           </div>
           <input
             type="search"
             placeholder="Buscar proyectos, clientes..."
             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
           />
         </div>
       </div>

       {/* Notificaciones y Perfil */}
       <div className="flex items-center space-x-4">
         <button className="relative p-2 text-gray-400 hover:text-gray-500">
           <Bell className="h-6 w-6" />
           <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
         </button>

         <div className="relative">
           <button
             onClick={() => setIsProfileOpen(!isProfileOpen)}
             className="flex items-center space-x-3 focus:outline-none"
           >
             <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
               <User className="h-5 w-5 text-gray-500" />
             </div>
             <span className="text-sm font-medium text-gray-700">
               {user?.displayName || user?.email}
             </span>
           </button>

           {isProfileOpen && (
             <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
               <div className="py-1">
                 <a
                   href="#"
                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                 >
                   Mi Perfil
                 </a>
                 <a
                   href="#"
                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                 >
                   Configuración
                 </a>
                 <button
                   onClick={handleLogout}
                   className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                 >
                   Cerrar Sesión
                 </button>
               </div>
             </div>
           )}
         </div>
       </div>
     </div>
   </header>
 );
}