import React from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell
} from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-50">
      
      {/* 1. LOGO / MARCA */}
      <div className="h-20 flex items-center px-8 border-b border-slate-800">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-lg">R</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Retain<span className="text-blue-500">AI</span>
            </h1>
        </div>
      </div>

      {/* 2. MENÚ DE NAVEGACIÓN */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        
        {/* Item Activo (Simulado) */}
        <button type="button" className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-600/20 transition-all group w-full text-left">
          <MapIcon size={20} />
          <span className="font-medium text-sm">Geospatial View</span>
        </button>

        {/* Items Inactivos */}
        <button type="button" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all group w-full text-left">
          <LayoutDashboard size={20} />
          <span className="font-medium text-sm">Dashboard General</span>
        </button>

        <button type="button" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all group w-full text-left">
          <Users size={20} />
          <span className="font-medium text-sm">Lista de Clientes</span>
        </button>

        <button type="button" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all group w-full text-left">
          <BarChart3 size={20} />
          <span className="font-medium text-sm">Analítica & KPIs</span>
        </button>

        <div className="pt-4 pb-2">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configuración</p>
        </div>

        <button type="button" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all group w-full text-left">
          <Settings size={20} />
          <span className="font-medium text-sm">Ajustes</span>
        </button>
      </nav>

      {/* 3. PERFIL DE USUARIO (Abajo) */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                AD
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">Admin User</h4>
                <p className="text-xs text-slate-400">admin@retainai.com</p>
            </div>
            <LogOut size={16} className="text-slate-500 hover:text-red-400" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;