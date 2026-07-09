import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SITE_URL = 'https://youmslogistic.fr';
const SITE_NAME = 'Youms Logistics';

interface SeoOptions {
  /** Clé i18n du titre (ex : "seo.services_title") */
  titleKey: string;
  /** Clé i18n de la description (ex : "seo.services_desc") */
  descKey: string;
  /** Chemin de la page pour l'URL canonique (ex : "/services"). Défaut : "/" */
  path?: string;
}

/** Crée ou met à jour une balise <meta> par name/property. */
function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Crée ou met à jour la balise <link rel="canonical">. */
function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Met à jour le titre, la meta description, l'URL canonique et les balises
 * Open Graph / Twitter de la page. Se rafraîchit au changement de langue.
 */
export function useSeo({ titleKey, descKey, path = '/' }: SeoOptions) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const title = t(titleKey);
    const description = t(descKey);
    const url = `${SITE_URL}${path}`;
    const image = `${SITE_URL}/youms-logo.png`;

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertCanonical(url);
    document.documentElement.lang = i18n.language;

    // Open Graph
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:locale', i18n.language === 'en' ? 'en_US' : 'fr_FR');

    // Twitter
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);
  }, [t, i18n.language, titleKey, descKey, path]);
}