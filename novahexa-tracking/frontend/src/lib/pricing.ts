/**
 * Simulateur de coût indicatif (cahier des charges §3.1).
 * -------------------------------------------------------------
 * Formule volontairement TRANSPARENTE et facile à ajuster.
 * Le back-end Spring Boot persistera le montant estimé envoyé par le
 * client (il ne recalcule pas : la formule de référence vit ici).
 */

export type TransportMode = 'ROUTE' | 'MER' | 'AIR';
export type DeliveryDelay = 'STANDARD' | 'EXPRESS' | 'JOUR_MEME';
export type MaterialType =
  | 'GENERAL'
  | 'AUTO_PARTS'
  | 'FRAGILE'
  | 'ELECTRONIQUE'
  | 'DOCUMENTS';

export interface PriceInput {
  mode: TransportMode;
  delay: DeliveryDelay;
  material: MaterialType;
  weightKg: number;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
}

// --- Paramètres ajustables -------------------------------------------------
const MODE_BASE: Record<TransportMode, number> = { ROUTE: 10, MER: 25, AIR: 40 };
const MODE_RATE_PER_KG: Record<TransportMode, number> = { ROUTE: 1.2, MER: 0.9, AIR: 3.5 };
const DELAY_MULT: Record<DeliveryDelay, number> = { STANDARD: 1, EXPRESS: 1.5, JOUR_MEME: 2.2 };
const MATERIAL_SURCHARGE: Record<MaterialType, number> = {
  GENERAL: 0,
  DOCUMENTS: 0,
  AUTO_PARTS: 8,
  FRAGILE: 12,
  ELECTRONIQUE: 15,
};
// Poids volumétrique : cm³ ramenés en kg (standard aérien = 5000).
const VOLUMETRIC_DIVISOR = 5000;
// --------------------------------------------------------------------------

export const MODE_LABELS: Record<TransportMode, string> = {
  ROUTE: 'Routier',
  MER: 'Maritime',
  AIR: 'Aérien',
};
export const DELAY_LABELS: Record<DeliveryDelay, string> = {
  STANDARD: 'Standard (4 jours)',
  EXPRESS: 'Express (48 h)',
  JOUR_MEME: 'Jour même',
};
export const MATERIAL_LABELS: Record<MaterialType, string> = {
  GENERAL: 'Marchandise générale',
  AUTO_PARTS: "Pièces auto",
  FRAGILE: 'Fragile',
  ELECTRONIQUE: 'Électronique',
  DOCUMENTS: 'Documents',
};

/** Poids facturable = max(poids réel, poids volumétrique). */
export function billableWeight(input: PriceInput): number {
  const vol = (input.heightCm * input.widthCm * input.lengthCm) / VOLUMETRIC_DIVISOR;
  return Math.max(input.weightKg || 0, vol || 0);
}

/** Coût indicatif en euros, arrondi au centime. */
export function estimatePrice(input: PriceInput): number {
  const billable = billableWeight(input);
  const base = MODE_BASE[input.mode];
  const variable = billable * MODE_RATE_PER_KG[input.mode];
  const surcharge = MATERIAL_SURCHARGE[input.material];
  const subtotal = (base + variable + surcharge) * DELAY_MULT[input.delay];
  return Math.round(subtotal * 100) / 100;
}

export function formatEUR(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}
