# 🧪 Rapport de tests — Novahexa Tracking

> Audit complet du code source (backend Java/Spring Boot + frontend React/TypeScript)
> Date : 02/07/2026

---

## Table des matières

1. [Résumé exécutif](#1-résumé-exécutif)
2. [Bugs critiques](#2-bugs-critiques)
3. [Bugs significatifs](#3-bugs-significatifs)
4. [Problèmes de branding (Youms → Novahexa)](#4-problèmes-de-branding)
5. [Incohérences Backend ↔ Frontend](#5-incohérences-backend--frontend)
6. [Fonctionnalités manquantes](#6-fonctionnalités-manquantes)
7. [Problèmes mineurs](#7-problèmes-mineurs)
8. [Matrice de test par fonctionnalité](#8-matrice-de-test-par-fonctionnalité)

---

## 1. Résumé exécutif

| Catégorie | Nombre |
|-----------|--------|
| 🔴 Bugs critiques | 4 |
| 🟠 Bugs significatifs | 6 |
| 🟡 Problèmes de branding | 8+ fichiers |
| 🔵 Incohérences Backend↔Frontend | 7 |
| ⚪ Fonctionnalités manquantes | 5 |
| 📝 Problèmes mineurs | 5 |

**Verdict :** L'application est fonctionnellement complète mais contient **4 bugs critiques** qui empêchent certaines fonctionnalités de fonctionner. Le branding "Youms Logistics" n'est pas entièrement migré vers "Novahexa".

---

## 2. Bugs critiques

### 🔴 C1 — Suppression de waypoints cassée (UUID vs Long)

**Fichier :** `ParcelService.java`, `AdminParcelController.java`

```java
// ParcelService.java
public void deleteWaypoint(String parcelId, Long waypointId) {  // ← Long
    Parcel p = getById(UUID.fromString(parcelId));
    p.getWaypoints().removeIf(wp -> wp.getId().equals(waypointId)); // ← UUID.equals(Long) = TOUJOURS false
```

`Waypoint.id` est de type `UUID`, mais le service et le contrôlleur attendent `Long`. La comparaison `UUID.equals(Long)` retourne **toujours false** → les waypoints ne peuvent **jamais** être supprimés.

**Impact :** La fonctionnalité de suppression d'arrêts est totalement cassée.

---

### 🔴 C2 — Détail colis client retourne 403 Forbidden

**Fichiers :** `ClientPackageDetail.tsx`, `api.ts`

```typescript
// api.ts
get: (id: string) => api.get<PackageItem>(`/api/admin/packages/${id}`),
```

Le composant `ClientPackageDetail` (route `/client/packages/:id`) appelle `packagesApi.get(id)` qui pointe vers `/api/admin/packages/{id}` — un endpoint qui nécessite le rôle `ADMIN`. Un utilisateur CLIENT reçoit une erreur **403**.

**Impact :** Les clients ne peuvent pas voir le détail de leurs propres colis.

---

### 🔴 C3 — Route `/client/packages` n'existe pas (404)

**Fichiers :** `Sidebar.tsx`, `App.tsx`

```typescript
// Sidebar.tsx
const clientNav = [
  { icon: Package, label: 'Mes colis', path: '/client/packages' }, // ← pas de route !
];

// App.tsx — aucune route pour /client/packages
<Route path="/client" element={...} />
<Route path="/client/packages/:id" element={...} />
// ← pas de /client/packages (liste)
```

Le lien "Mes colis" dans le sidebar client mène à `/client/packages` qui n'a pas de route définie → **404**.

**Impact :** Le lien de navigation client est cassé.

---

### 🔴 C4 — Formatage des modes de transport cassé dans les PDFs et analytics

**Fichiers :** `PdfService.java`, `AnalyticsService.java`

```java
// PdfService.formatEnum()
private String formatEnum(String name) {
    return switch (name) {
        case "ROUTIER" -> "Routier";   // ← JAMAIS atteint
        case "AERIEN" -> "Aérien";     // ← JAMAIS atteint
        case "MARITIME" -> "Maritime"; // ← JAMAIS atteint
        ...
    };
}
```

L'enum `TransportMode` a pour valeurs `ROUTE`, `MER`, `AIR` — mais le switch vérifie `ROUTIER`, `AERIEN`, `MARITIME`. **Aucun case ne correspond**, donc les PDFs et analytics affichent les codes bruts (`ROUTE`, `MER`, `AIR`) au lieu des labels (`Routier`, `Maritime`, `Aérien`).

**Impact :** Les devis, factures et étiquettes PDF affichent des noms de transport illisibles.

---

## 3. Bugs significatifs

### 🟠 S1 — Types frontend incohérents avec le backend

| Champ | Frontend (`types/index.ts`) | Backend (entity) |
|-------|---------------------------|-------------------|
| `User.id` | `number` | `UUID` (string) |
| `Waypoint.id` | `number` | `UUID` (string) |

Les comparaisons et le typage côté client sont incorrects pour ces champs UUID.

---

### 🟠 S2 — `PackageItem` ne contient pas `senderName` / `senderEmail`

**Frontend `types/index.ts` :**
```typescript
export interface PackageItem {
  // ...
  ownerName?: string;
  ownerEmail?: string;
  // MANQUANT : senderName, senderEmail, senderPhone
}
```

**Backend `ParcelView.java`** expose `senderName` mais pas `senderEmail`/`senderPhone`.

L'admin ne peut pas voir qui a soumis le colis (nom/email du déposant).

---

### 🟠 S3 — `ParcelView` manque plusieurs champs importants

| Champ | Présent dans `Parcel` | Présent dans `ParcelView` | Présent dans `PackageItem` (FE) |
|-------|----------------------|--------------------------|----------------------------------|
| `description` | ✅ | ❌ | ✅ (optionnel) |
| `senderEmail` | ✅ | ❌ | ❌ |
| `senderPhone` | ✅ | ❌ | ❌ |
| `deliveryDelay` | ✅ | ❌ | ❌ |
| `shippingDate` | ✅ | ❌ | ✅ (optionnel) |
| `heightCm/widthCm/lengthCm` | ✅ | ❌ | ✅ (optionnel) |

Les données existent en BDD mais ne remontent pas au frontend.

---

### 🟠 S4 — Serialization `Message` peut échouer (LazyInitializationException)

**Fichiers :** `MessageController.java`, `Message.java`

Le contrôlleur retourne `List<Message>` directement. Les champs `sender` (AppUser) et `parcel` (Parcel) sont `@ManyToOne(fetch = FetchType.LAZY)`. Avec `open-in-view: false` dans `application.yml`, Jackson ne peut pas accéder aux proxy lazy après la fermeture de la transaction → **LazyInitializationException** probable.

---

### 🟠 S5 — `formatEnum` ne gère pas `ELECTRONIQUE`

**Fichiers :** `PdfService.java`, `AnalyticsService.java`

```java
case "FOOD" -> "Alimentaire"; // ← FOOD n'existe pas dans MaterialType !
// MANQUANT : case "ELECTRONIQUE" -> "Électronique";
```

L'enum `MaterialType` contient `ELECTRONIQUE` mais le switch ne le gère pas. Par contre, il gère `FOOD` qui n'existe pas dans l'enum.

---

### 🟠 S6 — Le lien sidebar client `/client/packages` n'a pas de composant de liste

Même après correction de la route (C3), il n'existe pas de composant `ClientPackages` (liste des colis du client). Seul `ClientDashboard` (résumé) et `ClientPackageDetail` (détail) existent.

---

## 4. Problèmes de branding (Youms → Novahexa)

La marque a été partiellement migrée de "Youms Logistics" vers "Novahexa". **Les fichiers suivants contiennent encore des références à "Youms" :**

| Fichier | Références restantes |
|---------|---------------------|
| `Footer.tsx` | "Youms Logistics" (logo alt, texte, copyright, email) |
| `Login.tsx` | "Youms Logistics" dans le header |
| `Register.tsx` | "Youms Logistics" dans le header |
| `VerifyEmail.tsx` | "Youms Logistics" dans le logo |
| `ForgotPassword.tsx` | "Youms Logistics" dans le logo |
| `ResetPassword.tsx` | "Youms Logistics" dans le logo |
| `About.tsx` | "Youms Logistics" (texte, timeline) |
| `Services.tsx` | "Youms Logistics" dans la description |
| `Contact.tsx` | "contact@youmslogistics.com" |
| `FAQ.tsx` | "contact@youmslogistics.com" |
| `Legal.tsx` (3 pages) | "Youms Logistics", "youmslogistics.com" |
| `TrackingQR.tsx` | "YOUMS LOGISTICS" dans l'étiquette imprimable |
| `EmailService.java` | Templates d'email : "Youms Logistics" |
| `application.yml` | `from-email: noreply@youmslogistics.com`, `from-name: Youms Logistics` |

---

## 5. Incohérences Backend ↔ Frontend

### API endpoints

| Fonctionnalité | Frontend appelle | Backend endpoint | Statut |
|----------------|-----------------|------------------|--------|
| Lister mes colis (client) | `GET /api/client/packages` | ✅ Existe | ✅ |
| Détail colis (client) | `GET /api/admin/packages/{id}` | ⚠️ Admin seulement | 🔴 403 pour CLIENT |
| Lister tous les colis | `GET /api/admin/packages?status=ALL` | ✅ Existe | ✅ |
| Soumission colis | `POST /api/packages` | ✅ Existe | ✅ |
| Suivi public | `GET /api/track/{tn}` | ✅ Existe | ✅ |
| Validation | `PATCH /api/admin/packages/{tn}/validate` | ✅ Existe | ✅ |
| Refus | `PATCH /api/admin/packages/{tn}/refuse` | ✅ Existe | ✅ |
| Mise en transit | `PATCH /api/admin/packages/{tn}/in-transit` | ✅ Existe | ✅ |
| Marquer livré | `PATCH /api/admin/packages/{tn}/delivered` | ✅ Existe | ✅ |
| Ajouter waypoint | `POST /api/admin/packages/{id}/waypoints` | ✅ Existe | ✅ |
| Supprimer waypoint | `DELETE /api/admin/packages/{id}/waypoints/{wpId}` | ✅ Existe | 🔴 Bug type (C1) |
| Messages | `POST/GET /api/admin/packages/{id}/messages` | ✅ Existe | ⚠️ Lazy loading |
| Notifications | `GET /api/notifications` | ✅ Existe | ✅ |
| Contact | `POST /api/contact` | ✅ Existe | ✅ |
| Analytics | `GET /api/admin/analytics` | ✅ Existe | ✅ |
| Stats dashboard | `GET /api/admin/stats` | ❌ N'existe pas | ⚠️ Non utilisé |
| Upload photo | `POST /api/uploads` | ✅ Existe | ✅ |
| PDF devis | `GET /api/pdf/quote/{tn}` | ✅ Existe | ✅ |
| PDF facture | `GET /api/pdf/invoice/{tn}` | ✅ Existe | ✅ |
| PDF étiquette | `GET /api/pdf/label/{tn}` | ✅ Existe | ✅ |
| Pricing estimate | `POST /api/pricing/estimate` | ✅ Existe | ✅ |

### Contrat de données (ParcelView ↔ PackageItem)

| Champ ParcelView (Backend) | Champ PackageItem (Frontend) | Correspondance |
|---------------------------|------------------------------|----------------|
| `trackingNumber` | `trackingNumber` | ✅ |
| `name` | `name` | ✅ |
| `status` | `status` | ✅ |
| `senderName` | — | ❌ Manque côté FE |
| `originAddress` | `originAddress` | ✅ |
| `originLat/Lng` | `originLat/Lng` | ✅ |
| `destinationAddress` | `destinationAddress` | ✅ |
| `destinationLat/Lng` | `destinationLat/Lng` | ✅ |
| `transportMode` | `transportMode` | ✅ |
| `material` | — | ❌ Manque côté FE |
| `weightKg` | `weightKg` | ✅ |
| `estimatedCost` | `estimatedCost` | ✅ |
| `estimatedDuration` | `estimatedDuration` | ✅ |
| `refusalReason` | `refusalReason` | ✅ |
| `createdAt` | `createdAt` | ✅ |
| `validatedAt` | `validatedAt` | ✅ |
| `ownerName` | `ownerName` | ✅ |
| `ownerEmail` | `ownerEmail` | ✅ |
| `photoUrl` | `photoUrl` | ✅ |
| `waypoints` | `waypoints` | ✅ |
| `trackingEvents` | `trackingEvents` | ✅ |
| — | `id` | ⚠️ Backend ne l'envoie pas |
| — | `description` | ❌ Pas dans ParcelView |
| — | `senderEmail` | ❌ Pas dans ParcelView |
| — | `senderPhone` | ❌ Pas dans ParcelView |
| — | `shippingDate` | ❌ Pas dans ParcelView |
| — | `deliveryDelay` | ❌ Pas dans ParcelView |
| — | `heightCm/widthCm/lengthCm` | ❌ Pas dans ParcelView |
| — | `ownerId` | ❌ Pas dans ParcelView |
| — | `updatedAt` | ❌ Pas dans ParcelView |
| — | `messages` | ❌ Pas dans ParcelView |

---

## 6. Fonctionnalités manquantes

### ⬜ M1 — Pas d'endpoint `GET /api/client/packages/{id}`

Le client ne peut pas récupérer le détail d'un de ses colis via un endpoint dédié. Le seul endpoint disponible est `/api/admin/packages/{id}` qui nécessite le rôle ADMIN.

**Solution :** Ajouter un endpoint `GET /api/client/packages/{id}` dans `ClientParcelController` qui vérifie que le colis appartient bien à l'utilisateur connecté.

---

### ⬜ M2 — Pas de composant de liste des colis côté client

Le sidebar client propose "Mes colis" mais il n'y a pas de page liste dédiée. Le dashboard affiche un résumé, mais une page `/client/packages` avec filtres et recherche manque.

---

### ⬜ M3 — Le formulaire de soumission geocode en double

`PackageHeroForm` geocode les adresses côté client (Nominatim), mais le backend geocode à nouveau dans `ParcelService.submit()`. Le geocodage frontend est inutile car le backend n'accepte pas les coordonnées dans `ParcelSubmissionRequest`.

---

### ⬜ M4 — Pas de notification WebSocket côté client

Le backend configure STOMP/WebSocket (`WebSocketConfig`) et `MessageService` envoie des notifications via `wsTemplate.convertAndSend()`, mais aucun composant frontend n'écoute le WebSocket. Le `NotificationBell` utilise un polling 30s au lieu du temps réel.

---

### ⬜ M5 — Pas d'authentification persistante (token Base64 non signé)

Le token d'authentification est un simple `Base64(uuid:role:timestamp)` non signé. Il n'y a pas de validation de signature ni d'expiration. N'importe qui peut forger un token valide.

---

## 7. Problèmes mineurs

### 📝 m1 — Espaces blancs dans `Home.tsx`

```tsx
// Ligne alt avec espaces en début
alt="                Service de livraison Novahexa"

// Témoignage avec espaces en début
text:"                  Très professionnel..."
```

---

### 📝 m2 — `PublicPackageController.get()` est O(n)

```java
// Itère TOUS les colis pour trouver par ID
return parcels.listAll().stream()
    .filter(p -> p.getId().toString().equals(id))
    .findFirst()
```

Devrait utiliser `parcels.findById(UUID.fromString(id))` directement.

---

### 📝 m3 — `packagesApi.update()` appelle un endpoint inexistant

```typescript
update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/admin/packages/${id}`, data),
```

Il n'y a pas de `@PutMapping` pour les colis dans le backend. Cet appel échouera toujours.

---

### 📝 m4 — La suppression de contact message ne fonctionne pas côté frontend

`AdminContactMessages` ne propose aucun bouton de suppression de message de contact. Seul "Marquer traité" est disponible.

---

### 📝 m5 — Pas de gestion d'erreur utilisateur dans `NotificationBell`

Les erreurs de polling sont silencieusement ignorées (`catch {}`). L'utilisateur ne sera pas informé si les notifications ne se chargent pas.

---

## 8. Matrice de test par fonctionnalité

### Pages publiques

| Fonctionnalité | Test | Résultat | Notes |
|----------------|------|----------|-------|
| Page d'accueil | Affichage | ✅ | Hero, services, étapes, témoignages |
| Soumission colis (hero form) | Soumettre un colis | ⚠️ | Fonctionne mais geocodage inutile en double |
| Estimation coût temps réel | Changer paramètres | ✅ | Client + serveur |
| Suivi public | Rechercher par n° suivi | ✅ | Affiche statut, carte, QR, historique |
| Page services | Affichage | ✅ | |
| Page À propos | Affichage | ✅ | Contient encore "Youms Logistics" |
| FAQ | Recherche + accordéon | ✅ | |
| Contact | Soumettre message | ✅ | |
| Mentions légales | Affichage | ✅ | Contient encore "Youms Logistics" |

### Authentification

| Fonctionnalité | Test | Résultat | Notes |
|----------------|------|----------|-------|
| Inscription | Créer un compte | ✅ | Envoie email vérification |
| Vérification email | Cliquer lien | ✅ | Token 24h |
| Connexion | Se connecter | ✅ | Redirection selon rôle |
| Mot de passe oublié | Demander réinitialisation | ✅ | Email envoyé |
| Réinitialisation | Nouveau mot de passe | ✅ | Token 1h |
| Déconnexion | Se déconnecter | ✅ | Clear localStorage |

### Espace Client

| Fonctionnalité | Test | Résultat | Notes |
|----------------|------|----------|-------|
| Dashboard | Afficher résumé | ✅ | Stats calculées côté client |
| Liste mes colis | Naviguer vers `/client` | ✅ | Via dashboard |
| Détail colis | Cliquer sur un colis | 🔴 | **403** — utilise endpoint admin |
| Carte colis | Afficher carte Leaflet | ✅ | |
| QR Code | Afficher/imprimer | ✅ | |
| Télécharger devis PDF | Bouton | ✅ | |
| Télécharger facture PDF | Bouton | ✅ | |
| Étiquette expédition | Bouton | ✅ | |
| Notifications | Cloche notifications | ✅ | Polling 30s |
| Sidebar navigation | Cliquer liens | 🔴 | "Mes colis" → 404 |

### Espace Admin

| Fonctionnalité | Test | Résultat | Notes |
|----------------|------|----------|-------|
| Dashboard | Afficher stats | ✅ | Charts Recharts |
| Soumissions en attente | Liste PENDING | ✅ | |
| Valider un colis | Cliquer Valider | ✅ | Notification email |
| Refuser un colis | Motif + Confirmer | ✅ | Notification email |
| Gestion colis (tous statuts) | Liste/Filtre/Recherche | ✅ | |
| Mettre en transit | Bouton Truck | ✅ | |
| Marquer livré | Bouton Check | ✅ | |
| Supprimer colis | Bouton Trash | ✅ | |
| Carte globale | Vue map Leaflet | ✅ | Colis actifs + animations |
| Gestion waypoints | Ajouter sur carte | ✅ | |
| Supprimer waypoint | Bouton Trash | 🔴 | **Bug C1** — UUID vs Long |
| Messagerie admin→client | Envoyer message | ⚠️ | Lazy loading possible |
| Messages contact | Lister/traiter | ✅ | |
| Analytics | Charts & stats | ⚠️ | Labels transport cassés |
| PDF Devis | Télécharger | ⚠️ | Labels transport cassés |
| PDF Facture | Télécharger | ⚠️ | Labels transport cassés |
| PDF Étiquette | Télécharger | ✅ | |

### Backend API

| Endpoint | Méthode | Auth | Résultat test | Notes |
|----------|---------|------|---------------|-------|
| `POST /api/packages` | POST | Public | ✅ | |
| `GET /api/track/{tn}` | GET | Public | ✅ | |
| `GET /api/packages` | GET | Public | ⚠️ | Liste tous les colis (pas de filtre owner) |
| `POST /api/auth/register` | POST | Public | ✅ | |
| `POST /api/auth/login` | POST | Public | ✅ | |
| `POST /api/auth/verify-email` | POST | Public | ✅ | |
| `POST /api/auth/forgot-password` | POST | Public | ✅ | |
| `POST /api/auth/reset-password` | POST | Public | ✅ | |
| `POST /api/contact` | POST | Public | ✅ | |
| `POST /api/pricing/estimate` | POST | Public | ✅ | |
| `POST /api/uploads` | POST | Public | ⚠️ | Nécessite Cloudinary configuré |
| `GET /api/pdf/quote/{tn}` | GET | Public | ✅ | |
| `GET /api/pdf/invoice/{tn}` | GET | Public | ✅ | |
| `GET /api/pdf/label/{tn}` | GET | Public | ✅ | |
| `GET /api/client/packages` | GET | Auth | ✅ | |
| `GET /api/admin/packages` | GET | Admin | ✅ | |
| `GET /api/admin/packages/{id}` | GET | Admin | ✅ | |
| `PATCH /api/admin/packages/{tn}/validate` | PATCH | Admin | ✅ | |
| `PATCH /api/admin/packages/{tn}/refuse` | PATCH | Admin | ✅ | |
| `PATCH /api/admin/packages/{tn}/in-transit` | PATCH | Admin | ✅ | |
| `PATCH /api/admin/packages/{tn}/delivered` | PATCH | Admin | ✅ | |
| `POST /api/admin/packages/{id}/waypoints` | POST | Admin | ✅ | |
| `DELETE /api/admin/packages/{id}/waypoints/{wpId}` | DELETE | Admin | 🔴 | Bug type C1 |
| `DELETE /api/admin/packages/{id}` | DELETE | Admin | ✅ | |
| `POST /api/admin/packages/{id}/messages` | POST | Admin | ⚠️ | Lazy loading |
| `GET /api/admin/packages/{id}/messages` | GET | Admin | ⚠️ | Lazy loading |
| `GET /api/notifications` | GET | Public* | ✅ | *retourne tout si non auth |
| `GET /api/notifications/unread-count` | GET | Public* | ✅ | |
| `PUT /api/notifications/{id}/read` | PUT | Public | ✅ | |
| `PUT /api/notifications/read-all` | PUT | Public | ✅ | |
| `GET /api/admin/analytics` | GET | Admin | ✅ | |
| `GET /api/contact` | GET | Admin | ✅ | |
| `PUT /api/contact/{id}/treat` | PUT | Admin | ✅ | |

---

## Priorités de correction

### 🔴 Priorité 1 (bloquant)
1. **C2** — Ajouter `GET /api/client/packages/{id}` dans `ClientParcelController`
2. **C1** — Corriger le type `waypointId` de `Long` à `UUID` dans `ParcelService` et `AdminParcelController`
3. **C3** — Ajouter la route `/client/packages` dans `App.tsx` + créer le composant de liste

### 🟠 Priorité 2 (important)
4. **C4** — Corriger les noms d'enum dans `PdfService.formatEnum()` et `AnalyticsService.formatEnum()`
5. **S1** — Corriger les types `User.id` et `Waypoint.id` dans `types/index.ts` (number → string)
6. **S2/S3** — Enrichir `ParcelView` avec les champs manquants + ajouter au type `PackageItem`
7. **S4** — Ajouter `@EntityGraph` ou eager fetch pour `Message.sender`/`Message.parcel`

### 🟡 Priorité 3 (branding)
8. **B1** — Remplacer "Youms Logistics" par "Novahexa" dans tous les fichiers frontend
9. **B2** — Remplacer dans `EmailService.java` et `application.yml`

### ⚪ Priorité 4 (améliorations)
10. **M4** — Implémenter WebSocket côté frontend
11. **M3** — Supprimer le geocodage redondant dans `PackageHeroForm`
12. **M5** — Implémenter un vrai token JWT avec signature et expiration
