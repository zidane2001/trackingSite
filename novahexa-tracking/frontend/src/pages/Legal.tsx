import React from 'react';
import { Link } from 'react-router-dom';

export function Legal() {
  return (
    <div className="bg-[#eef2f6]">
      <section className="bg-[#060f24] text-white py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-[0.2em]">Mentions légales</span>
          <h1 className="text-4xl font-bold mt-3 mb-5">Conditions Générales d'Utilisation</h1>
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 prose prose-slate max-w-none">
          <h2>Article 1 — Objet</h2>
          <p>Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions dans lesquelles la société Novahexa Move met à disposition de ses utilisateurs le site et les services proposés, ainsi que de définir les droits et obligations des parties dans ce cadre.</p>

          <h2>Article 2 — Acceptation</h2>
          <p>Tout utilisateur du site novahexa.move reconnaît avoir pris connaissance des présentes CGU et les accepte sans réserve. L'utilisation des services implique l'acceptation pleine et entière des présentes CGU.</p>

          <h2>Article 3 — Services proposés</h2>
          <p>Le site novahexa.move permet de :</p>
          <ul>
            <li>Suivre publiquement un colis via son numéro de suivi</li>
            <li>Soumettre une demande d'enregistrement de colis (utilisateurs inscrits)</li>
            <li>Gérer et suivre ses envois depuis un espace personnel</li>
            <li>Estimer le coût d'expédition via un simulateur</li>
          </ul>

          <h2>Article 4 — Compte utilisateur</h2>
          <p>La création d'un compte est nécessaire pour soumettre et suivre des colis. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants.</p>

          <h2>Article 5 — Données personnelles</h2>
          <p>Les données personnelles collectées sont traitées conformément au RGPD. Pour plus d'informations, consultez notre <Link to="/legal/privacy" className="text-yellow-500 hover:underline">Politique de confidentialité</Link>.</p>

          <h2>Article 6 — Propriété intellectuelle</h2>
          <p>L'ensemble du contenu du site (textes, images, logos, graphismes) est la propriété exclusive de Novahexa Move ou de ses partenaires et est protégé par les lois en vigueur sur la propriété intellectuelle.</p>

          <h2>Article 7 — Responsabilité</h2>
          <p>Novahexa Move s'efforce d'assurer l'exactitude des informations publiées sur le site. Cependant, elle ne peut garantir l'absence d'erreurs et décline toute responsabilité concernant les dommages résultant de l'utilisation du site.</p>

          <h2>Article 8 — Modification des CGU</h2>
          <p>Novahexa Move se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle.</p>

          <p className="text-sm text-slate-400 mt-8">Dernière mise à jour : Juin 2026</p>
        </div>
      </section>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="bg-[#eef2f6]">
      <section className="bg-[#060f24] text-white py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-[0.2em]">Confidentialité</span>
          <h1 className="text-4xl font-bold mt-3 mb-5">Politique de confidentialité</h1>
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 prose prose-slate max-w-none">
          <h2>1. Collecte des données</h2>
          <p>Nous collectons les données suivantes dans le cadre de l'utilisation de nos services :</p>
          <ul>
            <li><strong>Données d'identification</strong> : nom complet, adresse email, numéro de téléphone</li>
            <li><strong>Données de colis</strong> : adresses d'envoi et de réception, poids, dimensions, descriptions</li>
            <li><strong>Données de navigation</strong> : adresse IP, pages visitées, durée de session</li>
          </ul>

          <h2>2. Finalité du traitement</h2>
          <p>Les données collectées sont utilisées pour :</p>
          <ul>
            <li>La gestion des comptes utilisateurs</li>
            <li>Le traitement et le suivi des colis</li>
            <li>L'envoi de notifications relatives au suivi</li>
            <li>L'amélioration de nos services</li>
          </ul>

          <h2>3. Base légale</h2>
          <p>Le traitement de vos données repose sur l'exécution du contrat de service et, le cas échéant, sur votre consentement (newsletter, cookies).</p>

          <h2>4. Durée de conservation</h2>
          <p>Vos données personnelles sont conservées pendant la durée de votre compte et pendant 3 ans après la dernière connexion.</p>

          <h2>5. Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants : accès, rectification, effacement, portabilité, opposition et limitation du traitement. Exercez vos droits en contactant privacy@novahexa.move.</p>

          <p className="text-sm text-slate-400 mt-8">Dernière mise à jour : Juin 2026</p>
        </div>
      </section>
    </div>
  );
}

export function CookiePolicy() {
  return (
    <div className="bg-[#eef2f6]">
      <section className="bg-[#060f24] text-white py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <span className="text-yellow-400 text-xs font-bold uppercase tracking-[0.2em]">Cookies</span>
          <h1 className="text-4xl font-bold mt-3 mb-5">Politique de cookies</h1>
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 prose prose-slate max-w-none">
          <h2>Qu'est-ce qu'un cookie ?</h2>
          <p>Un cookie est un petit fichier texte déposé sur votre appareil lors de la consultation d'un site web. Il permet de reconnaître votre navigateur et de mémoriser certaines informations.</p>

          <h2>Types de cookies utilisés</h2>
          <ul>
            <li><strong>Cookies essentiels</strong> : nécessaires au fonctionnement du site (authentification, session)</li>
            <li><strong>Cookies analytiques</strong> : nous aident à comprendre comment vous utilisez le site (Google Analytics)</li>
            <li><strong>Cookies de préférence</strong> : mémorisent vos choix (langue, thème)</li>
          </ul>

          <h2>Gestion des cookies</h2>
          <p>Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres de votre navigateur. La désactivation de certains cookies peut affecter le fonctionnement du site.</p>

          <h2>Cookies tiers</h2>
          <p>Nous utilisons OpenStreetMap pour l'affichage cartographique, qui peut déposer des cookies conformément à sa propre politique.</p>

          <p className="text-sm text-slate-400 mt-8">Dernière mise à jour : Juin 2026</p>
        </div>
      </section>
    </div>
  );
}
