// src/app/shared/components/layout/Sidebar.tsx
'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart,
  FolderOpen,
  ClipboardList
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'Pedidos',
    icon: ClipboardList,
    href: '/dashboard/orders',
  },
  {
    title: 'Proyectos',
    icon: FolderOpen,
    href: '/dashboard/projects',
  },{
    title: 'Planificador',
    icon: FolderOpen,
    href: '/dashboard/schedule',
  }, {
    title: 'Clientes',
    icon: Users,
    href: '/dashboard/clients',
  },
  {
    title: 'Facturas',
    icon: FileText,
    href: '/dashboard/invoices',
  },
  {
    title: 'Analytics',
    icon: BarChart,
    href: '/dashboard/analytics',
  },
  {
    title: 'Configuración',
    icon: Settings,
    href: '/dashboard/settings',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">DARU</h1>
      </div>
      
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon
                  className={`
                    mr-3 h-5 w-5
                    ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                  `}
                />
                {item.title}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}