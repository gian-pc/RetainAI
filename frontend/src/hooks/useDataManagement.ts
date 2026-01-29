import { useState } from 'react';

export interface StatusMessage {
    type: 'success' | 'error' | 'info' | null;
    message: string;
}

export const useDataManagement = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [status, setStatus] = useState<StatusMessage>({ type: null, message: '' });

    // Helper to extract error message
    const getErrorMessage = (error: unknown) => {
        if (error instanceof Error) return error.message;
        return String(error);
    };

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
            setFile(null); // Clear file after success
            return true;
        } catch (error) {
            console.error('Error:', error);
            setStatus({
                type: 'error',
                message: `❌ ${getErrorMessage(error)}`
            });
            return false;
        } finally {
            setUploading(false);
        }
    };

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
            return true;
        } catch (error) {
            console.error('Error:', error);
            setStatus({
                type: 'error',
                message: `❌ ${getErrorMessage(error)}`
            });
            return false;
        } finally {
            setDeleting(false);
        }
    };

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

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `customers_backup_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setStatus({ type: 'success', message: '✅ CSV exportado exitosamente' });
            return true;
        } catch (error) {
            console.error('Error:', error);
            setStatus({
                type: 'error',
                message: `❌ ${getErrorMessage(error)}`
            });
            return false;
        } finally {
            setExporting(false);
        }
    };

    return {
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
    };
};
