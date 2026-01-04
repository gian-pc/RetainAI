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
  };
  subscription?: {
    cuotaMensual: number;
    mesesPermanencia: number;
  };
}