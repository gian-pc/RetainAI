import React from 'react';

interface ExportSectionProps {
    onExport: () => void;
    isExporting: boolean;
}

export const ExportSection = ({ onExport, isExporting }: ExportSectionProps) => {
    return (
        <div
            className="rounded-lg border shadow-sm p-6 transition-colors"
            style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
            }}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2 flex items-center transition-colors" style={{ color: 'var(--text-primary)' }}>
                        <span className="text-2xl mr-2">📥</span>
                        Exportar Base de Datos
                    </h2>
                    <p className="mb-4 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                        Descarga un backup completo de todos los clientes en formato CSV
                    </p>
                    <ul className="text-sm space-y-1 mb-4 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                        <li>• Incluye: customers, subscriptions, customer_metrics, customer_context</li>
                        <li>• Formato compatible para re-importación</li>
                        <li>• NO incluye predicciones (se regeneran al predecir)</li>
                    </ul>
                </div>
                <button
                    onClick={onExport}
                    disabled={isExporting}
                    className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg"
                >
                    {isExporting ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Exportando...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Exportar CSV</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
