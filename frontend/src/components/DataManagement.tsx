'use client';

import { useState } from 'react';

export default function DataManagement() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // ========== DRAG & DROP HANDLERS ==========
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

  // ========== UPLOAD CSV ==========
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus({ type: 'info', message: 'Subiendo archivo...' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/api/customers/upload', {
        method: 'POST',
        body: formData,
      });

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || 'Error al subir el archivo');
      }

      setStatus({ type: 'success', message: `✅ ${message}` });
      setFile(null);

      // Limpiar input file
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error:', error);
      setStatus({
        type: 'error',
        message: `❌ ${error instanceof Error ? error.message : 'Error al procesar el archivo'}`
      });
    } finally {
      setUploading(false);
    }
  };

  // ========== DELETE DATABASE ==========
  const handleDelete = async () => {
    setDeleting(true);
    setStatus({ type: 'info', message: 'Eliminando todos los registros...' });

    try {
      const response = await fetch('http://localhost:8080/api/customers/all', {
        method: 'DELETE',
      });

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || 'Error al eliminar registros');
      }

      setStatus({ type: 'success', message: `✅ ${message}` });
      setShowDeleteConfirm(false);

    } catch (error) {
      console.error('Error:', error);
      setStatus({
        type: 'error',
        message: `❌ ${error instanceof Error ? error.message : 'Error al eliminar registros'}`
      });
    } finally {
      setDeleting(false);
    }
  };

  // ========== EXPORT CSV ==========
  const handleExport = async () => {
    setExporting(true);
    setStatus({ type: 'info', message: 'Generando CSV de respaldo...' });

    try {
      const response = await fetch('http://localhost:8080/api/customers/export', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al exportar datos');
      }

      // Obtener el blob del CSV
      const blob = await response.blob();

      // Crear URL temporal para descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers_backup_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus({ type: 'success', message: '✅ CSV exportado exitosamente' });

    } catch (error) {
      console.error('Error:', error);
      setStatus({
        type: 'error',
        message: `❌ ${error instanceof Error ? error.message : 'Error al exportar datos'}`
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Administración de Datos
        </h1>
        <p className="text-gray-600">
          Gestiona la base de datos: exporta, importa o limpia datos de clientes
        </p>
      </div>

      {/* Status Message */}
      {status.type && (
        <div
          className={`p-4 rounded-lg border ${
            status.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : status.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      {/* Section 1: Export Database */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
              <span className="text-2xl mr-2">📥</span>
              Exportar Base de Datos
            </h2>
            <p className="text-gray-600 mb-4">
              Descarga un backup completo de todos los clientes en formato CSV
            </p>
            <ul className="text-sm text-gray-500 space-y-1 mb-4">
              <li>• Incluye: customers, subscriptions, customer_metrics, customer_context</li>
              <li>• Formato compatible para re-importación</li>
              <li>• NO incluye predicciones (se regeneran al predecir)</li>
            </ul>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg"
          >
            {exporting ? (
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

      {/* Section 2: Upload CSV */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
          <span className="text-2xl mr-2">📤</span>
          Importar Datos desde CSV
        </h2>
        <p className="text-gray-600 mb-4">
          Sube un archivo CSV para poblar la base de datos con nuevos clientes
        </p>

        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
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
            disabled={uploading}
          />

          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
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
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Arrastra tu archivo CSV aquí
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  o haz click para seleccionar
                </p>
              </div>
            )}
          </label>
        </div>

        {file && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              {uploading ? (
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

      {/* Section 3: Delete Database */}
      <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
        <h2 className="text-xl font-semibold text-red-900 mb-2 flex items-center">
          <span className="text-2xl mr-2">🗑️</span>
          Limpiar Base de Datos
        </h2>
        <p className="text-red-700 mb-4">
          <strong>⚠️ Acción Irreversible:</strong> Elimina TODOS los registros de clientes y predicciones
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Borrar Todo</span>
          </button>
        ) : (
          <div className="bg-white border-2 border-red-300 rounded-lg p-4">
            <p className="text-red-900 font-semibold mb-4">
              ¿Estás seguro? Esta acción eliminará todos los clientes y predicciones de la base de datos.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Sí, Eliminar Todo</span>
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Workflow Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
          <span className="text-xl mr-2">💡</span>
          Flujo de Trabajo Recomendado
        </h3>
        <ol className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start">
            <span className="font-bold mr-2">1.</span>
            <span><strong>Exporta</strong> tu base de datos actual como respaldo (opcional pero recomendado)</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">2.</span>
            <span><strong>Limpia</strong> la base de datos para eliminar datos antiguos</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">3.</span>
            <span><strong>Importa</strong> el nuevo CSV con los clientes actualizados</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">4.</span>
            <span>Ve al <strong>Dashboard</strong> y haz clic en <strong>"Predecir Todos"</strong> para generar predicciones</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
