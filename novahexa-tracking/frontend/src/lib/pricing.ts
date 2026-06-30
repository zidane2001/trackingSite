/**
 * Simulateur de coût indicatif (cahier des charges §3.1).
 * -------------------------------------------------------------
 * Formule volontairement TRANSPARENTE et facile à ajuster.
 * Le back-end Spring Boot persistera le montant estimé envoyé par le
 * client (il ne recalcule pas : la formule de référence vit ici).
 */

export type TransportMode = 'route' | 'mer' | 'air';
export type DeliveryDelay = 'standard' | 'express' | 'jour_meme';
export type MaterialType =
  | 'general'
  | 'auto_parts'
  | 'fragile'
  | 'electronique'
  | 'documents';

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
const MODE_BASE: Record<TransportMode, number> = { route: 10, mer: 25, air: 40 };
const MODE_RATE_PER_KG: Record<TransportMode, number> = { route: 1.2, mer: 0.9, air: 3.5 };
const DELAY_MULT: Record<DeliveryDelay, number> = { standard: 1, express: 1.5, jour_meme: 2.2 };
const MATERIAL_SURCHARGE: Record<MaterialType, number> = {
  general: 0,
  documents: 0,
  auto_parts: 8,
  fragile: 12,
  electronique: 15,
};
// Poids volumétrique : cm³ ramenés en kg (standard aérien = 5000).
const VOLUMETRIC_DIVISOR = 5000;
// --------------------------------------------------------------------------

export const MODE_LABELS: Record<TransportMode, string> = {
  route: 'Routier',
  mer: 'Maritime',
  air: 'Aérien',
};
export const DELAY_LABELS: Record<DeliveryDelay, string> = {
  standard: 'Standard (4 jours)',
  express: 'Express (48 h)',
  jour_meme: 'Jour même',
};
export const MATERIAL_LABELS: Record<MaterialType, string> = {
  general: 'Marchandise générale',
  auto_parts: "Pièces auto",
  fragile: 'Fragile',
  electronique: 'Électronique',
  documents: 'Documents',
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
