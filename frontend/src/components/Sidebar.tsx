'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map as MapIcon,
  Users,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';

const navigation = [
  {
    section: 'Principal',
    items: [
      { name: 'Overview', href: '/', icon: LayoutDashboard },
      { name: 'Insights', href: '/insights', icon: BarChart3 },
    ]
  },
  {
    section: 'Operaciones',
    items: [
      { name: 'Customers', href: '/customers', icon: Users },
      { name: 'Geographic', href: '/geographic', icon: MapIcon },
    ]
  }
];

const Sidebar = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-700 flex flex-col fixed left-0 top-0 z-50 shadow-2xl">

      {/* LOGO / MARCA */}
      <div className="h-20 flex items-center px-8 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Retain<span className="text-indigo-400">AI</span>
          </h1>
        </div>
      </div>

      {/* MENÚ DE NAVEGACIÓN */}
      <nav className="flex-1 px-4 py-6 space-y-6">
        {navigation.map((section) => (
          <div key={section.section}>
            <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              {section.section}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group w-full text-left ${active
                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                  >
                    <Icon size={20} />
                    <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pt-4">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
            Configuración
          </p>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all group w-full text-left"
          >
            <Settings size={20} />
            <span className="font-medium text-sm">Ajustes</span>
          </Link>
        </div>
      </nav>

      {/* PERFIL DE USUARIO */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-all group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            AD
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">Admin User</h4>
            <p className="text-xs text-slate-400">admin@retainai.com</p>
          </div>
          <LogOut size={16} className="text-slate-500 group-hover:text-red-400 transition-colors" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;