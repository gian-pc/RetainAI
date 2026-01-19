// Tabs - Componente reutilizable de pestañas
'use client';

import React, { ReactNode } from 'react';

interface TabsProps {
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
}

interface TabProps {
    value: string;
    children: ReactNode;
}

export function Tabs({ value, onChange, children }: TabsProps) {
    const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[];

    return (
        <div className="border-b border-slate-200 mb-6">
            <div className="flex space-x-1 overflow-x-auto">
                {tabs.map((tab) => {
                    const isActive = tab.props.value === value;
                    return (
                        <button
                            key={tab.props.value}
                            onClick={() => onChange(tab.props.value)}
                            className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-all ${isActive
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            {tab.props.children}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export function Tab({ children }: TabProps) {
    return <>{children}</>;
}
