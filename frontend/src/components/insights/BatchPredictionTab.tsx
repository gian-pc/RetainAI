"use client";

import { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface BatchResult {
    customerId: string;
    risk: string | null;
    probability: number | null;
    mainFactor: string | null;
    nextBestAction: string | null;
    error: string | null;
}

interface BatchResponse {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    results: BatchResult[];
}

export default function BatchPredictionTab() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<BatchResponse | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8080/api/customers/predict/batch', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error en la predicción batch');
            }

            const data: BatchResponse = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar el archivo');
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const template = 'customer_id\n0002-ORFBO\n0003-MKNFE\n0004-TLHLJ';
        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'batch_template.csv';
        a.click();
    };

    const exportResults = () => {
        if (!results) return;

        const csv = [
            'customer_id,risk,probability,main_factor,next_best_action,error',
            ...results.results.map(r =>
                `${r.customerId},${r.risk || ''},${r.probability || ''},${r.mainFactor || ''},${r.nextBestAction || ''},${r.error || ''}`
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'batch_results.csv';
        a.click();
    };

    const getRiskColor = (risk: string | null) => {
        if (!risk) return 'text-gray-500';
        switch (risk.toLowerCase()) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-amber-600 bg-amber-50';
            case 'low': return 'text-emerald-600 bg-emerald-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">📦 Batch Prediction</h2>
                <p className="text-indigo-100">
                    Analiza múltiples clientes a la vez subiendo un archivo CSV
                </p>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                    1. Subir Archivo CSV
                </h3>

                {/* Drag & Drop Zone */}
                <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-300 bg-slate-50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />

                    {file ? (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-900">
                                <FileText className="inline h-4 w-4 mr-2" />
                                {file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {(file.size / 1024).toFixed(2)} KB
                            </p>
                            <button
                                onClick={() => setFile(null)}
                                className="text-sm text-red-600 hover:text-red-700"
                            >
                                Remover
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-slate-600 mb-2">
                                Arrastra tu archivo CSV aquí o
                            </p>
                            <label className="cursor-pointer">
                                <span className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                    Seleccionar Archivo
                                </span>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </>
                    )}

                    <p className="text-xs text-slate-500 mt-4">
                        Formato: customer_id por línea | Máximo: 1000 clientes
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Descargar Template
                    </button>

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                Analizar Clientes
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Results Section */}
            {results && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900">
                            2. Resultados
                        </h3>
                        <button
                            onClick={exportResults}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Exportar CSV
                        </button>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-sm text-slate-600">Total Procesados</p>
                            <p className="text-2xl font-bold text-slate-900">{results.totalProcessed}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-4">
                            <p className="text-sm text-emerald-600">Éxitos</p>
                            <p className="text-2xl font-bold text-emerald-700">{results.successCount}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4">
                            <p className="text-sm text-red-600">Errores</p>
                            <p className="text-2xl font-bold text-red-700">{results.errorCount}</p>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                                        Customer ID
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                                        Risk
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                                        Probability
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                                        Main Factor
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.results.map((result, idx) => (
                                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 text-sm font-mono text-slate-900">
                                            {result.customerId}
                                        </td>
                                        <td className="py-3 px-4">
                                            {result.risk ? (
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getRiskColor(result.risk)}`}>
                                                    {result.risk}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-700">
                                            {result.probability !== null ? `${(result.probability * 100).toFixed(1)}%` : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-slate-600">
                                            {result.mainFactor || '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            {result.error ? (
                                                <div className="flex items-center gap-1 text-red-600">
                                                    <XCircle className="h-4 w-4" />
                                                    <span className="text-xs">{result.error}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-emerald-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-xs">OK</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Instructions */}
            {!results && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-2">
                                Instrucciones
                            </h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• El archivo CSV debe tener una columna: <code className="bg-blue-100 px-1 rounded">customer_id</code></li>
                                <li>• Primera línea debe ser el header</li>
                                <li>• Un customer ID por línea</li>
                                <li>• Máximo 1000 clientes por archivo</li>
                                <li>• Descarga el template para ver un ejemplo</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
