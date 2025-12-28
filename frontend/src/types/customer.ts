// src/types/customer.ts

export interface Prediction {
  id: number;
  probabilidadFuga: number;
  resultadoPrediccion: string;
  factorPrincipal: string;
}

export interface Customer {
  customerId: string;
  gender: string;
  age: number;
  country: string;
  city: string;
  customerSegment: string;
  monthlyCharges: number;
  predictions: Prediction[];
}