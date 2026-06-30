/**
 * Centralisation de toutes les images du site.
 * -------------------------------------------------------------
 * Pour remplacer une image : change UNIQUEMENT l'URL ici.
 * - Les valeurs par défaut pointent vers Unsplash (libres de droits).
 * - En production tu remplaceras par tes URLs Cloudinary
 *   (ex: https://res.cloudinary.com/<cloud_name>/image/upload/...).
 * - Le logo Youms Logistics : place ton fichier dans /public
 *   et le chemin dans LOGO ci-dessous (ex: '/youms-logo.png').
 */

export const IMAGES = {
  // Logo Youms Logistics
  LOGO: '/youms-logo.png' as string,

  // Hero : visuel "livreur / logistique" qui se fond dans le bleu nuit.
  heroSubject:
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1200&auto=format&fit=crop',

  // Fond de hero discret (entrepôt) posé en faible opacité derrière le contenu.
  heroBackdrop:
    'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1600&auto=format&fit=crop',

  // Section "À grande échelle" (entrepôt), façon image de référence.
  warehouse:
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1600&auto=format&fit=crop',

  // Vignettes des services.
  serviceRoad:
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=800&auto=format&fit=crop',
  serviceSea:
    'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?q=80&w=800&auto=format&fit=crop',
  serviceAir:
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop',
} as const;

export type ImageKey = keyof typeof IMAGES;
