import React from 'react';
import { Customer } from '@/types/customer';

interface CustomerInfoCardProps {
    customer: Customer;
}

export const CustomerInfoCard = ({ customer }: CustomerInfoCardProps) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
                📋 Información del Cliente
            </h2>

            <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-sm text-slate-600">ID</span>
                    <span className="text-sm font-mono font-semibold text-slate-900">{customer.id}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-sm text-slate-600">Ciudad</span>
                    <span className="text-sm font-semibold text-slate-900">{customer.ciudad}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-sm text-slate-600">Segmento</span>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        {customer.segmento}
                    </span>
                </div>
                {customer.genero && (
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-sm text-slate-600">Género</span>
                        <span className="text-sm font-semibold text-slate-900">{customer.genero}</span>
                    </div>
                )}
                {customer.edad && (
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-sm text-slate-600">Edad</span>
                        <span className="text-sm font-semibold text-slate-900">{customer.edad} años</span>
                    </div>
                )}
                {customer.subscription && (
                    <>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="text-sm text-slate-600">Cuota Mensual</span>
                            <span className="text-sm font-semibold text-slate-900">
                                ${customer.subscription.cuotaMensual.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="text-sm text-slate-600">Antigüedad</span>
                            <span className="text-sm font-semibold text-slate-900">
                                {customer.subscription.mesesPermanencia} meses
                            </span>
                        </div>
                        {customer.subscription.tipoContrato && (
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-sm text-slate-600">Tipo Contrato</span>
                                <span className="text-sm font-semibold text-slate-900">
                                    {customer.subscription.tipoContrato}
                                </span>
                            </div>
                        )}
                    </>
                )}
                {customer.metrics && (
                    <>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="text-sm text-slate-600">NPS Score</span>
                            <span className="text-sm font-semibold text-slate-900">
                                {customer.metrics.scoreNps ?? 'N/A'}/100
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <span className="text-sm text-slate-600">CSAT Score</span>
                            <span className="text-sm font-semibold text-slate-900">
                                {customer.metrics.scoreCsat}/5
                            </span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                            <span className="text-sm text-slate-600">Tickets Soporte</span>
                            <span className="text-sm font-semibold text-slate-900">
                                {customer.metrics.ticketsSoporte}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
