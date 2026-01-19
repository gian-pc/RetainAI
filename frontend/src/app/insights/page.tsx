// Insights - Business Intelligence & Analytics
'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Tabs, Tab } from '@/components/ui/Tabs';
import SegmentationTab from '@/components/insights/SegmentationTab';
import CohortsTab from '@/components/insights/CohortsTab';
import ContractsTab from '@/components/insights/ContractsTab';
import SupportTab from '@/components/insights/SupportTab';
import BatchPredictionTab from '@/components/insights/BatchPredictionTab';

export default function InsightsPage() {
    const [activeTab, setActiveTab] = useState('segmentation');

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Business Intelligence</h1>
                    <p className="text-base text-slate-600">
                        Análisis profundo de datos de negocio y patrones de churn
                    </p>
                </header>

                {/* Tabs Navigation */}
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tab value="segmentation">🎯 Segmentación</Tab>
                    <Tab value="cohorts">⏰ Cohortes</Tab>
                    <Tab value="contracts">📄 Contratos</Tab>
                    <Tab value="support">🎫 Soporte</Tab>
                    <Tab value="batch">📦 Batch Prediction</Tab>
                </Tabs>

                {/* Tab Content */}
                <div className="mt-6">
                    {activeTab === 'segmentation' && <SegmentationTab />}
                    {activeTab === 'cohorts' && <CohortsTab />}
                    {activeTab === 'contracts' && <ContractsTab />}
                    {activeTab === 'support' && <SupportTab />}
                    {activeTab === 'batch' && <BatchPredictionTab />}
                </div>
            </main>
        </div>
    );
}
