// src/types/customer.ts

export interface Customer {
  id: string;
  pais: string;
  ciudad: string;
  segmento: string;

  // 🚨 IMPORTANTE: Este campo viene del JSON y lo necesitamos para el semáforo (Activo/Inactivo)
  abandonado: boolean;

  // Campos que tenías antes (Los dejo opcionales '?' por si el JSON no los trae)
  genero?: string;
  metrics?: {
    scoreCsat: number;
    ticketsSoporte: number;
    scoreNps?: number; // Added as per page usage
  };
  subscription?: {
    cuotaMensual: number;
    mesesPermanencia: number;
    tipoContrato?: string; // Added as per page usage
  };
  edad?: number; // Added
}

export interface PredictionResponse {
  risk: string;
  probability: number;
  main_factor: string;
  next_best_action: string;
}

export interface PredictionHistoryItem {
  id: number;
  probabilidadFuga: number;
  motivoPrincipal: string; // "main_factor" in history
  fechaAnalisis: string;
  nivelRiesgo: string; // "risk" in history
}