# Novahexa Tracking API (Spring Boot)

Back-end de la plateforme de suivi de colis.
Stack : **Spring Boot 3.3 · Java 17+ · PostgreSQL (Neon) · Cloudinary · Spring Security**.

> Remplace le back Node du cahier des charges (§12.1) par Spring Boot, à ta demande.

## 1. Prérequis
- JDK 17 ou + (testé jusqu'à 21)
- Maven 3.9+ (ou l'IDE IntelliJ/VS Code avec support Maven)
- Un projet **Neon** (PostgreSQL) et un compte **Cloudinary** (optionnel pour l'upload photo)

## 2. Variables d'environnement
À définir avant de lancer (shell, `.env`, ou config IDE) :

| Variable | Exemple | Rôle |
|---|---|---|
| `NEON_JDBC_URL` | `jdbc:postgresql://ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require` | URL JDBC Neon |
| `NEON_DB_USER` | `neondb_owner` | Utilisateur DB |
| `NEON_DB_PASSWORD` | `••••••` | Mot de passe DB |
| `CLOUDINARY_CLOUD_NAME` | `dxxxx` | Cloudinary (photos) |
| `CLOUDINARY_API_KEY` | `1234…` | Cloudinary |
| `CLOUDINARY_API_SECRET` | `abcd…` | Cloudinary |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Origines front autorisées |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@novahexa.local` / `admin123` | Admin créé au démarrage |
| `RESEND_API_KEY` | `re_...` | Envoi d'emails (optionnel) |
| `GEOCODING_ENABLED` | `true` | Activer le géocodage Nominatim |

> ⚠️ L'URL Neon doit être au format **JDBC** (`jdbc:postgresql://…`), pas l'URL `postgres://` brute.

## 3. Lancer
```bash
mvn spring-boot:run
# ou
mvn clean package && java -jar target/tracking-api-0.1.0.jar
```
Au premier démarrage, les tables sont créées (`ddl-auto=update`) et un compte admin est généré
(voir la console : `>>> Compte admin créé : …`).

## 4. Endpoints

### Public
| Méthode | Route | Rôle |
|---|---|---|
| `POST` | `/api/packages` | Soumission d'un colis (statut `PENDING`) |
| `GET` | `/api/track/{trackingNumber}` | Suivi public par numéro |
| `POST` | `/api/uploads` (multipart `file`) | Upload photo → URL Cloudinary |
| `POST` | `/api/contact` | Formulaire de contact |

### Admin (HTTP Basic, rôle ADMIN)
| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/admin/packages?status=PENDING|ALL` | File de validation |
| `GET` | `/api/admin/packages/{id}` | Récupérer un colis par ID |
| `PATCH` | `/api/admin/packages/{trackingNumber}/validate` | Valider |
| `PATCH` | `/api/admin/packages/{trackingNumber}/refuse` | Refuser (body `{ "reason": "…" }`) |
| `PATCH` | `/api/admin/packages/{trackingNumber}/in-transit` | Mettre en transit |
| `PATCH` | `/api/admin/packages/{trackingNumber}/delivered` | Marquer livré |
| `POST` | `/api/admin/packages/{parcelId}/waypoints` | Ajouter un waypoint |
| `DELETE` | `/api/admin/packages/{parcelId}/waypoints/{waypointId}` | Supprimer un waypoint |
| `DELETE` | `/api/admin/packages/{parcelId}` | Supprimer un colis |

## 5. Tester la soumission (cURL)
```bash
curl -X POST http://localhost:8080/api/packages \
  -H "Content-Type: application/json" \
  -d '{
    "senderName":"Ulrich Tenkeu","senderEmail":"u@test.com",
    "name":"Pièces moteur","material":"auto_parts",
    "weightKg":12.5,"dimensions":{"heightCm":40,"widthCm":30,"lengthCm":50},
    "originAddress":"Douala, CM","destinationAddress":"Lille, FR",
    "mode":"air","delay":"express","estimatedCost":187.5
  }'
```

## 6. Phase 3 (implémentée)
- ✅ Dashboard React connecté sur `/api/admin/packages`
- ✅ Auth front (login admin) avec JWT/Bearer token
- ✅ Géocodage Nominatim (adresses → coordonnées)
- ✅ Simulation de trajet sur carte (AdminMap)
- ✅ Notifications email via Resend (optionnel)
