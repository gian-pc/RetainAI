import React, { useState } from 'react';

interface DeleteSectionProps {
    onDelete: () => void;
    isDeleting: boolean;
}

export const DeleteSection = ({ onDelete, isDeleting }: DeleteSectionProps) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleConfirmDelete = async () => {
        await onDelete();
        setShowDeleteConfirm(false);
    };

    return (
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
                    disabled={isDeleting}
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
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {isDeleting ? (
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
                            disabled={isDeleting}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
