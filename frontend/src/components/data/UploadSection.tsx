import React, { useState } from 'react';

interface UploadSectionProps {
    file: File | null;
    setFile: (file: File | null) => void;
    onUpload: () => void;
    isUploading: boolean;
    setStatus: (status: { type: 'success' | 'error' | 'info' | null; message: string }) => void;
}

export const UploadSection = ({ file, setFile, onUpload, isUploading, setStatus }: UploadSectionProps) => {
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
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.csv')) {
                setFile(droppedFile);
                setStatus({ type: null, message: '' });
            } else {
                setStatus({ type: 'error', message: 'Por favor sube un archivo CSV' });
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.name.endsWith('.csv')) {
                setFile(selectedFile);
                setStatus({ type: null, message: '' });
            } else {
                setStatus({ type: 'error', message: 'Por favor sube un archivo CSV' });
            }
        }
    };

    return (
        <div
            className="rounded-lg border shadow-sm p-6 transition-colors"
            style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)'
            }}
        >
            <h2 className="text-xl font-semibold mb-2 flex items-center transition-colors" style={{ color: 'var(--text-primary)' }}>
                <span className="text-2xl mr-2">📤</span>
                Importar Datos desde CSV
            </h2>
            <p className="mb-4 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                Sube un archivo CSV para poblar la base de datos con nuevos clientes
            </p>

            {/* Drag & Drop Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                />

                <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                >
                    <svg
                        className="w-16 h-16 mb-4 transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>

                    {file ? (
                        <div className="text-center">
                            <p className="text-sm font-medium transition-colors" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                            <p className="text-xs mt-1 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm font-medium transition-colors" style={{ color: 'var(--text-primary)' }}>
                                Arrastra tu archivo CSV aquí
                            </p>
                            <p className="text-xs mt-1 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                                o haz click para seleccionar
                            </p>
                        </div>
                    )}
                </label>
            </div>

            {file && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onUpload}
                        disabled={isUploading}
                        className="px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg"
                    >
                        {isUploading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Subiendo...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span>Subir Dataset</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
