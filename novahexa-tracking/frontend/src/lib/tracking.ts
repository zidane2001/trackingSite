/**
 * Numéro de suivi public (cahier §5.2 : généré automatiquement à la soumission).
 * Le back-end Spring Boot reste l'autorité : si l'API répond, on utilise SON
 * numéro. Ce générateur sert d'affichage optimiste si l'API n'est pas joignable.
 * Format : NHX-XXXXXX (sans I/O/0/1 pour éviter les confusions de lecture).
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateTrackingNumber(): string {
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `NHX-${suffix}`;
}
