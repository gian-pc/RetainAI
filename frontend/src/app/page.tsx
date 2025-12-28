// src/app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Customer } from '@/types/customer';

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Esta función busca los datos en tu Backend Java
    const fetchCustomers = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/customers');
        if (!response.ok) throw new Error('Error al conectar');
        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo conectar con Java (localhost:8080)');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">RetainAI Dashboard</h1>

      {/* Estado de Carga */}
      {loading && <p>Cargando datos...</p>}

      {/* Estado de Error */}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}

      {/* Tabla de Datos */}
      {!loading && !error && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Ciudad</th>
                <th className="p-4">Riesgo Fuga</th>
                <th className="p-4">Causa</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.customerId} className="border-b hover:bg-gray-50 text-black">
                  <td className="p-4">{c.customerId}</td>
                  <td className="p-4">{c.city}</td>
                  <td className="p-4">
                    {c.predictions?.[0]?.probabilidadFuga 
                      ? `${(c.predictions[0].probabilidadFuga * 100).toFixed(0)}%`
                      : 'N/A'}
                  </td>
                  <td className="p-4">{c.predictions?.[0]?.factorPrincipal || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}