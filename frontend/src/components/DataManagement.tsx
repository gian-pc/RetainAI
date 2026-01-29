'use client';

import { useDataManagement } from '@/hooks/useDataManagement';
import { ExportSection } from './data/ExportSection';
import { UploadSection } from './data/UploadSection';
import { DeleteSection } from './data/DeleteSection';

export default function DataManagement() {
  const {
    file,
    setFile,
    uploading,
    deleting,
    exporting,
    status,
    setStatus,
    handleUpload,
    handleDelete,
    handleExport
  } = useDataManagement();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
          Administración de Datos
        </h1>
        <p className="transition-colors" style={{ color: 'var(--text-secondary)' }}>
          Gestiona la base de datos: exporta, importa o limpia datos de clientes
        </p>
      </div>

      {/* Status Message */}
      {status.type && (
        <div
          className={`p-4 rounded-lg border transition-colors ${status.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
            : status.type === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
            }`}
        >
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      {/* Sections */}
      <ExportSection
        onExport={handleExport}
        isExporting={exporting}
      />

      <UploadSection
        file={file}
        setFile={setFile}
        onUpload={handleUpload}
        isUploading={uploading}
        setStatus={setStatus}
      />

      <DeleteSection
        onDelete={handleDelete}
        isDeleting={deleting}
      />

      {/* Workflow Guide */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 transition-colors">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center transition-colors">
          <span className="text-xl mr-2">💡</span>
          Flujo de Trabajo Recomendado
        </h3>
        <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-2 transition-colors">
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
