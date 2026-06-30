# Novahexa Move — Suivi de colis

Livraison **Phase 1 (front)** + **Phase 2 (back Spring Boot)**.

## Ce qui a été fait

### Phase 1 — Front (`frontend/`)
- `/` pointe désormais sur **`Home.tsx`** (avant, `/` affichait Tracking ; Home n'était branché nulle part — corrigé).
- **Hero refait** : image « livreur/logistique » fondue dans le bleu nuit + fond entrepôt discret, dans la palette **jaune + bleu nuit** existante.
- **Formulaire de dépôt de colis directement dans le hero** (cahier §5.2) : infos perso (nom, email, tél), colis (nom, matériel, poids, dimensions), trajet (départ/arrivée), livraison (mode, délai, date).
- **Simulateur de prix en direct** (cahier §3.1) : le coût se recalcule à chaque frappe.
- **N° de suivi auto** + **écran de confirmation** « en cours de traitement » avec copie du numéro.
- Frise **« 4 étapes »** (comme l'image de réf), **section entrepôt**, **services avec visuels**, **chiffres clés**.
- Toutes les images sont centralisées dans **`src/config/images.ts`** → tu remplaces une URL et c'est appliqué partout. Dépose ton **logo** dans `frontend/public/` et mets son chemin dans `IMAGES.LOGO`.

Fichiers clés ajoutés :
`src/config/images.ts`, `src/lib/pricing.ts`, `src/lib/tracking.ts`, `src/lib/api.ts`,
`src/components/PackageHeroForm.tsx`, `src/pages/Home.tsx` (réécrit), `src/App.tsx` + `Header.tsx` (FR).

### Phase 2 — Back (`backend/`)
API Spring Boot (Neon + Cloudinary) avec : soumission, suivi public, file de validation admin
(valider/refuser), upload photo, contact. Détails et lancement → **`backend/README.md`**.

## Lancer en local
```bash
# 1) Front
cd frontend
npm install
cp .env.example .env        # ajuste VITE_API_BASE_URL si besoin
npm run dev                 # http://localhost:5173

# 2) Back (dans un autre terminal) — voir backend/README.md pour les variables Neon/Cloudinary
cd backend
mvn spring-boot:run         # http://localhost:8080
```
Tant que le back n'est pas lancé, le formulaire affiche quand même un n° de suivi (mode optimiste).
Dès que le back tourne, la soumission est **persistée en base** et prête pour la validation admin.

## Décision d'archi
Le cahier §12.1 prévoyait Node.js : **remplacé par Spring Boot + Neon + Cloudinary** à ta demande.
Le reste du cahier (entités, statuts `PENDING → VALIDATED/REFUSED → IN_TRANSIT → DELIVERED`,
workflow de validation) est respecté.

## Phase 3 (prochaine étape, non incluse)
Câbler le **Dashboard** existant sur `/api/admin/packages`, l'auth admin (login → HTTP Basic/JWT),
puis le géocodage + la simulation de trajet sur carte (cahier §7) et les notifications email.
