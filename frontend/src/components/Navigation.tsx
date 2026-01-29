'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayoutContext } from '@/context/LayoutContext';

import { LayoutDashboard, Target, Users, Database, Sun, Moon } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { setPredictionModalOpen, theme, toggleTheme } = useLayoutContext();

  const navItems = [
    { name: 'Centro de Comando', href: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Acciones Prioritarias', href: '/actions', icon: <Target className="w-4 h-4" /> },
    { name: 'Clientes', href: '/customers', icon: <Users className="w-4 h-4" /> },
    { name: 'Datos', href: '/data-management', icon: <Database className="w-4 h-4" /> },
  ];

  // Force light theme styles if on /actions page
  const isActionsPage = pathname === '/actions';

  // Fix: Force body background to match light theme on Actions page
  useEffect(() => {
    if (isActionsPage) {
      document.body.style.background = '#f9fafb'; // gray-50
      document.body.style.color = '#171717';     // foreground
    } else {
      document.body.style.background = '';
      document.body.style.color = '';
    }

    return () => {
      document.body.style.background = '';
      document.body.style.color = '';
    };
  }, [isActionsPage]);

  // Helper to get effective style values
  const getNavStyle = () => {
    if (isActionsPage) {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'rgba(243, 244, 246, 1)',
        borderWidth: '1px'
      };
    }
    return {
      backgroundColor: 'var(--nav-bg)',
      borderColor: 'var(--card-border)',
      borderWidth: '1px'
    };
  };

  const getContainerStyle = () => {
    if (isActionsPage) {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.90)',
        borderColor: 'rgba(243, 244, 246, 1)'
      };
    }
    return {
      backgroundColor: 'var(--surface-bg)',
      borderColor: 'var(--card-border)'
    };
  };

  const getLogoColor = () => {
    if (isActionsPage) {
      return '#1e293b'; // slate-800
    }
    return 'var(--text-primary)';
  };

  return (
    <div className="sticky top-4 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="backdrop-blur-xl shadow-2xl rounded-2xl transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10"
          style={getNavStyle()}
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo Area */}
              <div className="flex items-center group cursor-pointer">
                <Link href="/" className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-xl font-bold tracking-tight transition-colors" style={{ color: getLogoColor() }}>
                    RetainAI
                  </span>
                </Link>
              </div>

              {/* Navigation Links and Action Button */}
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center gap-1 p-1 rounded-xl border"
                  style={getContainerStyle()}
                >
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    let bgColor = isActive ? 'var(--active-item-bg)' : 'transparent';
                    let textColor = isActive ? 'var(--active-item-text)' : 'var(--text-secondary)';

                    // Override for Actions page forced light mode
                    if (isActionsPage) {
                      if (isActive) {
                        bgColor = '#ffffff';
                        textColor = '#4f46e5';
                      } else {
                        textColor = '#64748b'; // slate-500
                      }
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                            relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-out flex items-center gap-2
                            ${isActive ? 'shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'hover:opacity-80'}
                          `}
                        style={{
                          backgroundColor: bgColor,
                          color: textColor
                        }}
                      >
                        {isActive && (
                          <span className="absolute inset-0 rounded-lg opacity-50 -z-10" style={{ backgroundColor: bgColor }}></span>
                        )}
                        <span className={`text-base transition-transform duration-300 ${isActive ? 'scale-110' : 'grayscale opacity-70 group-hover:grayscale-0'}`}>
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl transition-all"
                  style={{
                    backgroundColor: isActionsPage ? 'rgba(255, 255, 255, 0.90)' : 'var(--surface-bg)',
                    color: isActionsPage ? '#64748b' : 'var(--text-secondary)'
                  }}
                  title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Predict Button */}
                <button
                  onClick={() => setPredictionModalOpen(true)}
                  className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 origin-left"></div>
                  <div className="flex items-center gap-2 relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span>Predecir Todos</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
