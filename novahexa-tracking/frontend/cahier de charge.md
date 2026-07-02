
CAHIER DES CHARGES
Plateforme de Suivi de Colis & de Tracking
Site vitrine + Espace client + Back-office administrateur
Version 1.0 — Document de spécifications fonctionnelles et techniques
Date : Juin 2026
Préparé pour : Ulrich Zidane Tenkeu Cielalie
 
Sommaire


 
1. Contexte et objectifs du projet
1.1 Présentation générale
Le projet consiste à développer une plateforme web complète de suivi de colis (tracking), structurée autour de trois espaces distincts : un site vitrine public présentant l'entreprise et ses services, un espace client permettant à tout utilisateur inscrit de soumettre et suivre ses colis, et un back-office administrateur permettant de valider, gérer et piloter l'ensemble des envois.
Le parcours de référence retenu pour le flow public (page de suivi, formulaire de recherche par numéro, structure du site vitrine) s'appuie sur le modèle des sites professionnels de transport et logistique (type Novahexa Move), adapté et enrichi avec un véritable workflow de validation et une simulation de trajet en temps réel sur carte interactive.
1.2 Objectifs du projet
•	Offrir à tout visiteur la possibilité de suivre un colis publiquement via un simple numéro de suivi, sans connexion obligatoire.
•	Permettre à un utilisateur inscrit de soumettre lui-même une demande d'enregistrement de colis, soumise à validation par l'administrateur.
•	Donner à l'administrateur un outil de pilotage complet : validation, modification, refus, suivi cartographique, gestion des points d'arrêt, communication avec les clients.
•	Visualiser sur une carte réelle (OpenStreetMap) le déplacement simulé d'un colis entre son point de départ et son point d'arrivée, en tenant compte de la durée estimée et des points d'arrêt intermédiaires.
•	Notifier automatiquement le client à chaque étape clé du cycle de vie de son colis (validation, refus, passage à un point d'arrêt, livraison).
•	Présenter une vitrine commerciale crédible et professionnelle (accueil, services, calcul de coût indicatif, FAQ, contact) à l'image des sites de référence du secteur.
1.3 Périmètre du projet — Vue d'ensemble
Inclus dans cette version
Site vitrine public complet (accueil, services, simulateur de coût, FAQ, contact)
Authentification (client et administrateur) avec rôles distincts
Soumission de colis par le client avec statut « En attente » (pending)
Back-office de validation / modification / refus par l'administrateur
Carte interactive avec simulation du trajet réel (départ → points d'arrêt → arrivée)
Estimation automatique de la durée et du moyen de transport
Notifications par email et in-app à chaque étape
Messagerie libre admin → client (email personnalisé depuis le back-office)
Historique complet des trajets et des statuts

Hors périmètre de cette version (évolutions futures)
Intégration API avec un transporteur tiers réel (DHL, Chronopost, etc.)
Application mobile dédiée pour les livreurs avec GPS temps réel
Gestion de centaines/milliers de colis simultanés (scalabilité avancée)
API publique exposée à des partenaires externes
Statistiques avancées et reporting BI
Paiement en ligne des frais d'envoi
 
2. Acteurs et rôles du système
2.1 Typologie des utilisateurs
Rôle	Description	Statut d'accès
Visiteur	Toute personne non connectée naviguant sur le site vitrine.	Public
Client (utilisateur inscrit)	Possède un compte, peut soumettre des colis, suivre ses envois, recevoir des notifications.	Authentifié
Administrateur	Gère l'ensemble des colis, valide ou refuse les soumissions, pilote la carte et les points d'arrêt, communique avec les clients.	Authentifié (rôle Admin)
2.2 Matrice des droits d'accès
Action	Visiteur	Client	Administrateur
Consulter le site vitrine	Oui	Oui	Oui
Suivre un colis via n° public	Oui	Oui	Oui
Créer un compte / se connecter	—	Oui	Oui
Soumettre un colis (statut pending)	Non	Oui	Oui
Voir l'historique de ses propres colis	Non	Oui	Oui (tous les colis)
Valider / modifier / refuser une soumission	Non	Non	Oui
Définir les points d'arrêt d'un trajet	Non	Non	Oui
Envoyer un email personnalisé à un client	Non	Non	Oui
Accéder au tableau de bord global	Non	Non	Oui
 
3. Site vitrine public
Le site vitrine constitue la porte d'entrée publique de la plateforme. Il reprend la structure éprouvée des sites de transport et logistique professionnels, avec une page d'accueil orientée conversion, une présentation des services, un simulateur de coût indicatif et un point de contact.
3.1 Page d'accueil
•	Bannière principale (hero) — accroche commerciale, visuel, bouton d'appel à l'action vers « Suivre un envoi » et « Créer un compte ».
•	Simulateur de coût indicatif — formulaire interactif permettant d'estimer un coût approximatif en fonction du mode de livraison (air / mer / route), du type de matériel, du délai souhaité (standard / express / jour même), du poids et des dimensions (hauteur, largeur, longueur). Le calcul s'affiche dynamiquement sans rechargement de page.
•	Présentation des points forts — blocs courts mettant en avant la livraison express, le suivi actif, la gestion des comptes et la fiabilité du service.
•	Chiffres clés / réassurance — compteurs (nombre d'entrepôts, livraisons réussies, expéditions, clients satisfaits) pour renforcer la crédibilité.
•	Processus logistique en 4 étapes — frise illustrée : paiement des frais → dépôt ou ramassage → suivi du colis → livraison.
•	Témoignages clients — carrousel d'avis clients avec nom, ville et commentaire.
•	Bandeau d'appel à l'action final — incitation à demander un devis ou à suivre un envoi.
3.2 Page « Services »
•	Présentation détaillée des modes de transport proposés (aérien, maritime, routier, ferroviaire / conteneurs selon pertinence du projet).
•	Fiches services avec visuel, titre et description courte.
•	Lien vers la page de contact / demande de devis depuis chaque service.
3.3 Page « Suivre l'envoi » (tracking public)
C'est la page centrale du parcours public, reprenant fidèlement le flow de référence : un champ unique de saisie du numéro de suivi, sans authentification requise.
•	Champ de saisie — un seul champ « Entrez votre numéro de suivi » avec exemple de format affiché en placeholder.
•	Bouton de recherche — déclenche la requête et affiche le résultat sur la même page, sans rechargement complet.
•	Résultat affiché — nom du colis/élément, identifiant, statut actuel, dernière position connue, date et heure de dernière mise à jour, et carte interactive avec la position et — si le colis est validé — la trajectoire complète.
•	Gestion des cas d'erreur — message clair si le numéro n'existe pas, si le colis est encore en attente de validation (« Votre colis est en cours de traitement »), ou si le format saisi est invalide.
3.4 Page « À propos »
•	Présentation de l'entreprise, mission, valeurs.
•	Éventuellement une frise historique ou des engagements qualité/sécurité.
3.5 Page « FAQ »
Accordéon de questions/réponses reprenant les thématiques clés : services proposés, zones couvertes, modalités de contact, procédure de suivi, gestion des retards, options de stockage. Le contenu est administrable depuis le back-office (ajout/édition/suppression de questions).
3.6 Page « Contact »
•	Formulaire de contact (nom, email, message, case d'acceptation des CGU).
•	Coordonnées de l'entreprise (adresse, téléphone, email) et carte de localisation.
•	Les messages envoyés sont consultables depuis le back-office administrateur.
3.7 Pages légales
•	Conditions Générales d'Utilisation (CGU).
•	Politique de confidentialité.
•	Politique de cookies.
 
4. Authentification et gestion de compte
4.1 Inscription (client)
•	Formulaire d'inscription : nom complet, email, mot de passe (avec confirmation), numéro de téléphone (recommandé pour les notifications futures).
•	Validation des champs en temps réel (format email, robustesse du mot de passe, correspondance des deux mots de passe).
•	Vérification de l'adresse email par lien de confirmation envoyé automatiquement.
•	Message de bienvenue après confirmation du compte.
4.2 Connexion
•	Formulaire de connexion par email / mot de passe, commun à l'interface mais redirigeant selon le rôle (client → espace client, administrateur → back-office).
•	Option « Mot de passe oublié » avec envoi d'un lien de réinitialisation par email.
•	Gestion des erreurs (identifiants invalides, compte non vérifié, compte désactivé).
•	Mécanisme de session sécurisé (jeton JWT ou session serveur) avec expiration et renouvellement.
4.3 Déconnexion
•	Action accessible depuis le menu utilisateur, invalidant la session côté serveur et redirigeant vers la page d'accueil.
4.4 Gestion du profil
•	Le client peut consulter et modifier ses informations personnelles (nom, email, téléphone, mot de passe).
•	L'administrateur dispose d'un profil dédié avec ses informations et, si plusieurs administrateurs sont prévus à terme, la possibilité de gérer ses propres préférences de notification.
 
5. Espace client
5.1 Tableau de bord client
•	Vue synthétique de tous les colis du client, avec statut visuel (badge coloré : En attente, Validé, En transit, Livré, Refusé).
•	Accès rapide à la fiche détaillée de chaque colis.
•	Notifications récentes affichées en tête de tableau de bord.
•	Bouton d'accès direct au formulaire de soumission d'un nouveau colis.
5.2 Soumission d'un colis par le client
Le client peut déclarer lui-même un colis à suivre. Cette soumission n'est pas immédiatement active : elle entre dans le système avec le statut « En attente » (pending) et reste invisible publiquement tant qu'elle n'a pas été traitée par l'administrateur.
•	Informations demandées au client — nom de l'élément/colis, description (optionnelle), adresse et coordonnées de départ, adresse et coordonnées d'arrivée, poids et dimensions (réutilisés pour l'estimation du moyen de transport), date d'envoi souhaitée, photo du colis (optionnelle).
•	Génération automatique — un identifiant de suivi unique est généré automatiquement dès la soumission, permettant au client de le communiquer même avant validation.
•	Confirmation de soumission — écran de confirmation et email récapitulatif précisant que la demande est en cours d'examen par l'équipe.
5.3 Suivi d'un colis (vue client connecté)
•	Fiche détaillée par colis : nom, identifiant, statut, dernière position, date/heure de dernière mise à jour.
•	Carte interactive affichant le point de départ, le point d'arrivée, les points d'arrêt définis par l'administrateur, et la position actuelle simulée du colis sur le trajet.
•	Historique chronologique des événements (« Demande soumise », « Validée par l'administrateur », « Arrivée au point d'arrêt — Lille », « Livré »).
•	Fil de messages reçus de l'administrateur concernant ce colis spécifique.
5.4 Notifications côté client
•	Centre de notifications in-app (icône cloche avec compteur de notifications non lues).
•	Réception d'un email à chaque changement de statut majeur : validation, refus (avec motif), passage à un point d'arrêt, livraison.
•	Réception des emails personnalisés envoyés manuellement par l'administrateur.
 
6. Back-office administrateur
6.1 Tableau de bord administrateur
•	Nombre total d'éléments suivis, avec répartition par statut (en attente, validés, en transit, livrés, refusés).
•	Liste des demandes en attente de validation, mises en avant en priorité.
•	Accès rapide à la carte globale (vue d'ensemble de tous les colis actifs).
•	Derniers messages de contact reçus depuis le site vitrine.
6.2 Gestion des soumissions (file d'attente de validation)
C'est le cœur du workflow métier : chaque colis soumis par un client transite par cette file avant de devenir visible et actif.
•	Liste des demandes en attente — tableau filtrable et triable (par date, par client, par statut), avec aperçu rapide des informations soumises.
•	Fiche de validation — vue détaillée de la demande permettant à l'administrateur de consulter toutes les informations soumises par le client (adresses, coordonnées, poids, dimensions, photo).
•	Action « Valider » — confirme l'enregistrement, fait passer le colis du statut « En attente » à « Validé », rend le colis visible dans le suivi public, déclenche automatiquement la notification au client et lance le calcul du trajet.
•	Action « Modifier avant validation » — permet à l'administrateur de corriger ou compléter les informations (coordonnées précises, moyen de transport, dimensions) avant de valider.
•	Action « Refuser » — nécessite la saisie d'un motif de refus, qui sera transmis au client par notification.
•	Historique de traitement — conservation de toutes les actions effectuées sur chaque demande (qui a validé/modifié/refusé, et quand), à des fins de traçabilité.
6.3 Gestion des éléments suivis (CRUD complet)
•	Ajouter un colis ou un élément à suivre directement depuis le back-office (sans passer par une soumission client).
•	Modifier les informations d'un colis existant : nom, identifiant, statut, coordonnées, points d'arrêt.
•	Supprimer un élément, avec confirmation et conservation d'une trace dans les journaux d'activité (soft delete recommandé).
•	Recherche et filtres avancés (par statut, par client, par plage de dates, par identifiant).
6.4 Configuration du trajet (départ, arrivée, points d'arrêt)
Une fois un colis validé, l'administrateur configure le trajet qui sera simulé sur la carte et communiqué au client.
•	Définition du point de départ — adresse saisie ou sélectionnée sur la carte, avec récupération automatique des coordonnées GPS (géocodage).
•	Définition du point d'arrivée — même principe, avec calcul automatique de la distance entre les deux points.
•	Ajout de points d'arrêt intermédiaires — l'administrateur peut ajouter, réordonner ou supprimer des étapes (ex. : France → Belgique, avec un arrêt à Lille). Chaque point d'arrêt déclenche une notification au client lorsque le colis simulé l'atteint.
•	Estimation automatique du moyen de transport — le système propose un mode de transport (routier, aérien, maritime) en fonction de la distance totale et des options choisies par l'administrateur ou le client (standard / express / jour même), avec possibilité de forcer manuellement un autre choix.
•	Calcul automatique de la durée estimée — la durée totale du trajet est calculée à partir de la distance, du moyen de transport retenu et du nombre de points d'arrêt, puis répartie entre chaque segment du parcours.
6.5 Messagerie client personnalisée
•	Espace dédié dans la fiche de chaque colis permettant à l'administrateur de rédiger un email libre à destination du client concerné (objet + corps de message).
•	L'email est envoyé directement à l'adresse du client et une copie du message est conservée dans l'historique de communication du colis, visible également côté client (fil de messages).
•	Usage prévu : informations personnalisées, justificatifs de retard, demandes de précision, etc.
6.6 Gestion du contenu du site vitrine
•	Édition des questions/réponses de la FAQ.
•	Consultation des messages reçus via le formulaire de contact, avec statut « traité / non traité ».
 
7. Carte interactive et simulation de trajet
La carte est l'élément central de l'expérience de suivi, aussi bien côté public que côté client connecté et administrateur. Elle s'appuie sur OpenStreetMap, gratuit et sans clé d'API payante.
7.1 Affichage de base
•	Fond de carte OpenStreetMap, avec niveau de zoom adapté automatiquement à l'étendue du trajet affiché.
•	Marqueur distinct pour le point de départ, le point d'arrivée, chaque point d'arrêt, et la position actuelle simulée du colis.
•	Info-bulle (popup) au clic sur un marqueur, affichant le nom du lieu, l'heure de passage estimée ou réelle, et le statut associé.
•	Vue multi-marqueurs pour le tableau de bord administrateur, affichant l'ensemble des colis actifs simultanément sur une carte globale.
7.2 Logique de simulation du déplacement
En l'absence de dispositif GPS physique sur le terrain dans cette version, le déplacement du colis sur la carte est simulé de façon réaliste à partir des données saisies par l'administrateur :
1.	L'administrateur définit le point de départ et le point d'arrivée (avec coordonnées géographiques précises).
2.	Le système calcule la distance totale entre ces deux points.
3.	Le moyen de transport est déterminé (automatiquement selon la distance et les options, ou imposé manuellement par l'administrateur).
4.	La durée totale du trajet est estimée à partir de la distance et du moyen de transport (vitesse moyenne associée à chaque mode).
5.	Si des points d'arrêt sont définis, le trajet est découpé en plusieurs segments, chacun avec sa propre durée estimée proportionnelle à sa distance.
6.	La position du colis affichée sur la carte progresse de façon continue le long du trajet (interpolation entre les coordonnées), en fonction du temps écoulé depuis la validation, donnant l'illusion d'un déplacement en temps réel.
7.	Lorsque la position simulée atteint un point d'arrêt, le statut et l'historique se mettent à jour automatiquement et une notification est envoyée au client.
8.	Lorsque la position atteint le point d'arrivée, le colis passe automatiquement au statut « Livré » (ou « Arrivé à destination », selon configuration).
7.3 Tracé du trajet
•	Tracé d'un itinéraire visuel entre les points (ligne reliant départ, arrêts et arrivée) calculé via un service de routage gratuit compatible OpenStreetMap (ex. OSRM) lorsque pertinent, ou via une ligne géodésique simplifiée selon le mode de transport (aérien/maritime).
•	Distinction visuelle du segment déjà parcouru (trait plein) et du segment restant (trait pointillé).
 
8. Cycle de vie d'un colis et statuts
Le cycle de vie complet d'un colis traverse deux grandes phases : la phase de soumission/validation, puis la phase de transit simulé sur la carte.
8.1 Tableau des statuts
Statut	Déclencheur	Effet visible côté client
En attente (pending)	Soumission par le client via son espace personnel	Colis non visible publiquement ; le client voit « En cours de traitement »
Validé	Action de l'administrateur sur la fiche de soumission	Colis visible dans le suivi public ; email + notification in-app envoyés au client
Refusé	Action de l'administrateur, avec motif obligatoire	Email + notification in-app avec le motif du refus
En transit	Automatique, dès que la position simulée quitte le point de départ	La carte affiche la progression ; mise à jour de la position et de l'horodatage
Point d'arrêt atteint	Automatique, lorsque la position simulée atteint une étape intermédiaire	Notification au client (« Votre colis est passé par Lille »)
Livré	Automatique, lorsque la position simulée atteint le point d'arrivée	Notification finale ; le colis reste consultable en historique
8.2 Diagramme du flux de validation
Parcours d'une soumission client
1. Le client se connecte et soumet un colis  →  Statut : En attente
2. L'administrateur consulte la fiche dans le back-office
3a. Validation directe  →  Statut : Validé  →  notification au client
3b. Modification puis validation  →  Statut : Validé  →  notification au client
3c. Refus avec motif  →  Statut : Refusé  →  notification au client
4. Si validé : configuration du trajet (départ, arrivée, points d'arrêt)
5. Simulation automatique du déplacement sur la carte jusqu'à livraison
 
9. Système de notifications
9.1 Canaux retenus pour cette version
•	Email — envoi automatique via un service d'envoi transactionnel, pour chaque événement clé du cycle de vie ainsi que pour les messages personnalisés rédigés par l'administrateur.
•	Notification in-app — centre de notifications dans l'espace client connecté, avec indicateur visuel de notifications non lues.
9.2 Événements déclencheurs
Événement	Notification envoyée	Destinataire
Soumission reçue	Email de confirmation avec récapitulatif et identifiant de suivi.	Client
Colis validé	Email + notification in-app.	Client
Colis refusé	Email + notification in-app, avec motif.	Client
Point d'arrêt atteint	Email + notification in-app, avec nom de l'étape et heure.	Client
Colis livré	Email + notification in-app.	Client
Message personnalisé admin	Email + entrée dans le fil de messages du colis.	Client
Nouvelle soumission en attente	Notification dans le tableau de bord admin.	Administrateur
Nouveau message de contact	Notification dans le tableau de bord admin.	Administrateur
 
10. Informations affichées pour chaque élément suivi
Conformément au socle fonctionnel du projet, chaque colis ou élément suivi affiche a minima les informations suivantes, enrichies par le workflow de validation et la simulation de trajet :
•	Nom de l'élément / du colis.
•	Identifiant unique de suivi.
•	Statut actuel (En attente, Validé, En transit, Point d'arrêt atteint, Livré, Refusé).
•	Dernière position enregistrée (adresse et coordonnées).
•	Date et heure de la dernière mise à jour.
•	Point de départ et point d'arrivée.
•	Liste des points d'arrêt et leur statut (atteint / à venir).
•	Moyen de transport estimé ou défini.
•	Durée totale estimée et durée restante.
•	Historique chronologique complet des événements.
•	Fil de messages échangés avec l'administrateur.
 
11. Modèle de données (vue conceptuelle)
Cette section propose une structure de données de référence pour guider la conception de la base PostgreSQL. Elle sera affinée lors de la phase de modélisation technique détaillée.
Table : users
Champ	Type	Description
id	UUID / Serial	Identifiant unique
full_name	Varchar	Nom complet
email	Varchar (unique)	Adresse email, utilisée pour la connexion
password_hash	Varchar	Mot de passe haché
phone	Varchar	Numéro de téléphone (optionnel)
role	Enum	client / admin
is_verified	Boolean	Email confirmé ou non
created_at	Timestamp	Date de création du compte

Table : packages (colis)
Champ	Type	Description
id	UUID / Serial	Identifiant interne
tracking_number	Varchar (unique)	Numéro de suivi public
name	Varchar	Nom de l'élément/colis
description	Text	Description optionnelle
owner_id	FK → users.id	Client à l'origine de la soumission
status	Enum	pending / validated / refused / in_transit / delivered
refusal_reason	Text	Motif de refus (si applicable)
origin_address	Varchar	Adresse de départ
origin_lat / origin_lng	Decimal	Coordonnées du point de départ
destination_address	Varchar	Adresse d'arrivée
destination_lat / destination_lng	Decimal	Coordonnées du point d'arrivée
transport_mode	Enum	routier / aérien / maritime
weight_kg	Decimal	Poids du colis
dimensions	JSON	Hauteur / largeur / longueur
estimated_duration	Interval	Durée totale estimée
validated_at	Timestamp	Date de validation par l'admin
validated_by	FK → users.id	Administrateur ayant validé
created_at / updated_at	Timestamp	Horodatage de création / mise à jour

Table : waypoints (points d'arrêt)
Champ	Type	Description
id	UUID / Serial	Identifiant
package_id	FK → packages.id	Colis concerné
label	Varchar	Nom du point d'arrêt (ex. : Lille)
order_index	Integer	Ordre de passage sur le trajet
lat / lng	Decimal	Coordonnées géographiques
estimated_arrival	Timestamp	Heure estimée de passage
reached_at	Timestamp	Heure réelle de passage (rempli automatiquement par la simulation)

Table : tracking_events (historique)
Champ	Type	Description
id	UUID / Serial	Identifiant
package_id	FK → packages.id	Colis concerné
event_type	Enum	submitted / validated / refused / waypoint_reached / delivered
description	Text	Libellé de l'événement
created_at	Timestamp	Date/heure de l'événement

Table : messages (communication admin → client)
Champ	Type	Description
id	UUID / Serial	Identifiant
package_id	FK → packages.id	Colis concerné
sender_id	FK → users.id	Administrateur expéditeur
subject	Varchar	Objet de l'email
body	Text	Contenu du message
sent_at	Timestamp	Date d'envoi

Table : notifications
Champ	Type	Description
id	UUID / Serial	Identifiant
user_id	FK → users.id	Destinataire
type	Varchar	Type d'événement déclencheur
content	Text	Contenu affiché dans le centre de notifications
is_read	Boolean	Lue / non lue
created_at	Timestamp	Date de création

Table : contact_messages (formulaire de contact)
Champ	Type	Description
id	UUID / Serial	Identifiant
name	Varchar	Nom du visiteur
email	Varchar	Email du visiteur
message	Text	Contenu du message
status	Enum	non_traité / traité
created_at	Timestamp	Date de réception
 
12. Spécifications techniques
12.1 Stack technologique
Couche	Technologie retenue	 
Frontend	HTML / CSS / JavaScript (interface site vitrine, espace client, back-office)	—
Backend	Node.js (API REST, logique métier, calcul de simulation de trajet)	—
Base de données	PostgreSQL	—
Cartographie	OpenStreetMap (fond de carte gratuit), avec service de géocodage et de routage compatible (ex. Nominatim, OSRM)	—
Authentification	Sessions sécurisées ou JWT, mots de passe hachés (bcrypt ou équivalent)	—
Envoi d'emails	Service transactionnel externe (ex. SMTP dédié ou fournisseur d'emailing)	—
12.2 Architecture générale
•	Architecture client-serveur classique : frontend consommant une API REST exposée par le backend Node.js.
•	Séparation claire des trois espaces applicatifs : site vitrine public, espace client (authentifié, rôle client), back-office (authentifié, rôle admin).
•	Un moteur de simulation de trajet (tâche planifiée / job périodique) recalcule régulièrement la position simulée de chaque colis « en transit » et déclenche les événements (passage de point d'arrêt, livraison) en conséquence.
12.3 Sécurité
•	Hachage des mots de passe, jamais de stockage en clair.
•	Protection des routes par rôle (middleware de vérification client / administrateur).
•	Validation et assainissement des données saisies côté serveur (en complément de la validation côté client).
•	Protection contre les attaques courantes (injection SQL via requêtes paramétrées, XSS, CSRF sur les formulaires sensibles).
•	Limitation du taux de requêtes (rate limiting) sur les endpoints sensibles (connexion, recherche de numéro de suivi).
 
13. Planning indicatif de réalisation
Planning donné à titre indicatif, à ajuster selon les ressources disponibles. Il suit une logique de construction progressive, du socle technique vers les fonctionnalités les plus avancées.
Étape	Contenu	Durée estimée
Phase 1	Mise en place du socle technique : base de données, authentification, structure du site vitrine (pages statiques).	1 à 2 semaines
Phase 2	Espace client : inscription, connexion, soumission de colis, tableau de bord client.	1 à 2 semaines
Phase 3	Back-office administrateur : file de validation, CRUD des colis, configuration du trajet.	2 semaines
Phase 4	Intégration cartographique : affichage OpenStreetMap, géocodage, tracé du trajet, moteur de simulation de déplacement.	2 à 3 semaines
Phase 5	Notifications (email + in-app), messagerie admin → client, FAQ et formulaire de contact.	1 semaine
Phase 6	Tests, corrections, finitions visuelles, préparation au déploiement.	1 semaine

Ce document a vocation à servir de référence partagée pour le développement de la plateforme. Il pourra être affiné au fil de l'avancement, notamment sur les aspects de maquettage visuel (UI/UX), le détail exact des écrans, et les choix précis de bibliothèques techniques.
