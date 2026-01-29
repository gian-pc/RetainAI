import { HeatmapPoint } from '@/hooks/useHeatmapData';

const BOROUGH_NAME_MAP: Record<string, string> = {
    'STATEN ISLAND': 'STATEN_ISLAND',
    'STATEN_ISLAND': 'STATEN_ISLAND',
    'MANHATTAN': 'MANHATTAN',
    'BROOKLYN': 'BROOKLYN',
    'QUEENS': 'QUEENS',
    'BRONX': 'BRONX',
    'THE BRONX': 'BRONX'
};

export const normalizeBoroughName = (name: string): string => {
    const upper = name.toUpperCase().trim();
    return BOROUGH_NAME_MAP[upper] || upper;
};

export const calculateBoroughStats = (heatmapData: HeatmapPoint[]) => {
    const boroughStats = new Map<string, { avgIncome: number; avgDensity: number; count: number; totalIncome: number; totalDensity: number }>();

    heatmapData.forEach(point => {
        if (!point.borough) return;
        const borough = normalizeBoroughName(point.borough);

        if (!boroughStats.has(borough)) {
            boroughStats.set(borough, { avgIncome: 0, avgDensity: 0, count: 0, totalIncome: 0, totalDensity: 0 });
        }

        const stats = boroughStats.get(borough)!;
        stats.count++;
        if (point.ingresoMediano) stats.totalIncome += point.ingresoMediano;
        if (point.densidadPoblacional) stats.totalDensity += point.densidadPoblacional;
    });

    // Calculate averages
    boroughStats.forEach((stats) => {
        stats.avgIncome = stats.count > 0 ? stats.totalIncome / stats.count : 0;
        stats.avgDensity = stats.count > 0 ? stats.totalDensity / stats.count : 0;
    });

    return boroughStats;
};

export const enrichBoroughFeatures = (features: any[], boroughStats: Map<string, any>) => {
    features.forEach((feature: any) => {
        const boroughName = normalizeBoroughName(feature.properties.name || '');
        const stats = boroughStats.get(boroughName);

        if (stats) {
            feature.properties.socioeconomic_score = stats.avgIncome;
            feature.properties.population_density = stats.avgDensity;
            feature.properties.customer_count = stats.count;
        } else {
            feature.properties.socioeconomic_score = 0;
            feature.properties.population_density = 0;
            feature.properties.customer_count = 0;
        }
    });
};
