'use client';

import React from 'react';
import { Sparkles, TrendingUp, Map, Users, AlertTriangle, DollarSign } from 'lucide-react';

interface SuggestedQuestion {
    id: string;
    text: string;
    icon: React.ReactNode;
    category: 'churn' | 'geographic' | 'customer' | 'financial' | 'risk';
    description: string;
}

const IMPACTFUL_QUESTIONS: SuggestedQuestion[] = [
    {
        id: 'bronx-risk',
        text: '¿Qué borough tiene mayor riesgo de churn y por qué?',
        icon: <Map className="w-4 h-4" />,
        category: 'geographic',
        description: 'Correlación entre ubicación y churn'
    },
    {
        id: 'socioeconomic-impact',
        text: 'Muéstrame cómo la situación socioeconómica afecta el churn',
        icon: <TrendingUp className="w-4 h-4" />,
        category: 'churn',
        description: 'Análisis de factores socioeconómicos'
    },
    {
        id: 'high-risk-customers',
        text: '¿Cuántos clientes están en riesgo crítico ahora mismo?',
        icon: <AlertTriangle className="w-4 h-4" />,
        category: 'risk',
        description: 'Identificación de clientes críticos'
    },
    {
        id: 'revenue-at-risk',
        text: '¿Cuántos ingresos estamos en riesgo de perder este mes?',
        icon: <DollarSign className="w-4 h-4" />,
        category: 'financial',
        description: 'Impacto financiero del churn'
    },
    {
        id: 'population-density',
        text: '¿Las zonas de mayor densidad poblacional tienen más churn?',
        icon: <Users className="w-4 h-4" />,
        category: 'geographic',
        description: 'Densidad vs. tasa de cancelación'
    },
    {
        id: 'retention-actions',
        text: 'Dame las 3 acciones más urgentes para retener clientes hoy',
        icon: <Sparkles className="w-4 h-4" />,
        category: 'risk',
        description: 'Recomendaciones inmediatas'
    }
];

interface SuggestedQuestionsProps {
    onQuestionClick: (question: string) => void;
    isVisible: boolean;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
    onQuestionClick,
    isVisible
}) => {
    if (!isVisible) return null;

    return (
        <div className="px-4 pb-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Sugerencias
                </h3>
            </div>

            <div className="flex flex-col gap-2">
                {IMPACTFUL_QUESTIONS.map((q) => (
                    <button
                        key={q.id}
                        onClick={() => onQuestionClick(q.text)}
                        className="
                            group flex items-center gap-3 w-full
                            p-2.5 rounded-xl
                            bg-white/80 backdrop-blur-md border border-white/20
                            hover:bg-white/95 hover:shadow-md transition-all duration-200
                            text-left shadow-sm pointer-events-auto
                        "
                    >
                        <div className="
                            flex-shrink-0 p-1.5 rounded-md
                            bg-slate-50/50 text-slate-500
                            group-hover:bg-indigo-50 group-hover:text-indigo-600
                            transition-colors
                        ">
                            {q.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 group-hover:text-slate-900 transition-colors">
                                {q.text}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                {q.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-2 text-center pointer-events-auto">
                <p className="text-[10px] text-slate-500 font-medium bg-white/50 inline-block px-2 py-1 rounded-full backdrop-blur-sm">
                    💡 Selecciona una pregunta para ver el análisis en tiempo real
                </p>
            </div>
        </div>
    );
};
