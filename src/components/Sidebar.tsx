'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, BarChart2, Users, Settings, Menu, X,  DollarSign} from 'lucide-react';

interface SidebarProps {
  companyName: string;
  logoUrl?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ companyName, logoUrl }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // ✅ moved hook here

  const routes = [
    { name: 'Dashborad', path: '/', icon: <Home size={20} /> },
    { name: 'Products', path: '/products', icon: <BarChart2 size={20} /> },
    { name: 'Pricing', path: '/pricing', icon: <DollarSign size={20} /> },
    { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div 
      className={`h-screen bg-gradient-to-b from-black to-blue-950 text-white transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } sticky left-0 top-4rem shadow-lg h-`}
    >
      <div className="flex justify-between items-center p-4">

        <button 
          onClick={toggleSidebar} 
          className="text-white p-1 rounded-md hover:bg-blue-800"
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <div className="mt-8">
        {routes.map((route) => {
          const isActive = pathname === route.path;
          return (
            <Link 
              href={route.path} 
              key={route.path}
              className={`flex items-center px-4 py-3 ${
                isActive 
                  ? 'bg-blue-800 text-white border-l-4 border-white' 
                  : 'text-blue-200 hover:bg-blue-800'
              } transition-all duration-200`}
            >
              <div className="flex items-center gap-4">
                <div>{route.icon}</div>
                {!isCollapsed && <span>{route.name}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      <div className={`absolute bottom-0 left-0 right-0 p-4 ${isCollapsed ? 'text-center' : ''}`}>
        {!isCollapsed && (
          <div className="text-sm text-blue-300 mb-2">
            {new Date().getFullYear()} © {companyName}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
