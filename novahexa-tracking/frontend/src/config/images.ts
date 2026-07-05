/**
 * Centralisation de toutes les images du site.
 * -------------------------------------------------------------
 * Toutes les images sont servies depuis /public/images/ (ou Cloudinary en prod).
 * Pour remplacer une image : remplace le fichier dans /public/images/
 * et mets à jour le chemin ici.
 */

export const IMAGES = {
  // Logo Youms Logistics (transparent / sans fond — header, sidebar, login, etc.)
  LOGO: '/youms-logo.png' as string,

  // Logo Youms Logistics avec arrière-plan blanc (footer, factures, PDF)
  LOGO_WITH_BG: '/youms-logo-avec-arrière-plan.png' as string,

  // Hero : visuel "livreur / logistique" qui se fond dans le bleu nuit.
  heroSubject: '/images/hero-subject.jpg',

  // Fond de hero discret (entrepôt) posé en faible opacité derrière le contenu.
  heroBackdrop: '/images/hero-backdrop.jpg',

  // Section "À grande échelle" (entrepôt), façon image de référence.
  warehouse: '/images/warehouse.jpg',

  // Vignettes des services.
  serviceRoad: '/images/service-road.jpg',
  serviceSea: '/images/service-sea.jpg',
  serviceAir: '/images/service-air.jpg',
} as const;

export type ImageKey = keyof typeof IMAGES;
