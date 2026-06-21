# Carnet de voyage — itinéraires immersifs

Un site qui présente des voyages sous forme d'itinéraires immersifs : la carte
trace la route au fil du défilement, chaque journée se révèle avec photos,
vidéos et prix, et le visiteur compose ses expériences pendant que l'estimation
se met à jour en direct.

- **Côté visiteur** : lecture + sélection d'options cochables → total et
  récapitulatif (avec demande de devis).
- **Côté admin** : création de plusieurs voyages, édition des étapes, médias,
  prix et options, publication.

## Stack

Next.js 15 (App Router) · TypeScript · Prisma · SQLite (dev) / PostgreSQL (prod)
· authentification par session JWT (cookie httpOnly, mots de passe hachés
bcrypt) · Leaflet + fond de carte CARTO sombre (sans clé API) · Framer Motion ·
Tailwind CSS.

## Démarrage local

```bash
npm install
cp .env .env.local        # ou gardez .env tel quel pour le dev
npx prisma db push        # crée la base SQLite (dev.db)
npm run db:seed           # charge le voyage Islande de démo + l'admin
npm run dev
```

- Site : http://localhost:3000
- Voyage démo : http://localhost:3000/voyage/islande-cote-sud
- Admin : http://localhost:3000/admin → **admin@voyage.test / voyage123**

> Réinitialiser les données : `npm run db:reset`

### Charger tous les voyages d'exemple

`npm run db:seed` ne charge que l'Islande. Pour retrouver **les quatre voyages**,
lancez aussi (après `npx prisma db push`) :

```bash
npm run db:seed             # Islande (réinitialise la base + admin)
npm run db:seed:albanie     # Albanie, la Riviera sauvage du Sud
npm run db:seed:bulgarie    # Bulgarie, Sofia et les montagnes de Rila
npm run db:seed:hurghada    # Croisière plongée — Best of Hurghada
```

Chaque seed `db:seed:<slug>` est **idempotent** : il ne recrée que son propre
voyage (sans effacer les autres) et garantit la présence de l'admin.

## Variables d'environnement

| Variable       | Rôle                                                       |
| -------------- | ---------------------------------------------------------- |
| `DATABASE_URL` | Connexion base. SQLite en dev, Postgres en prod.           |
| `AUTH_SECRET`  | Secret de signature des sessions. **À changer en prod** (`openssl rand -base64 32`). |

## Passer en production (PostgreSQL)

1. Dans `prisma/schema.prisma`, remplacez `provider = "sqlite"` par
   `provider = "postgresql"`.
2. Mettez `DATABASE_URL` sur votre base (Neon, Supabase, Vercel Postgres…).
3. `npx prisma db push` puis `npm run db:seed` (optionnel).
4. Définissez un `AUTH_SECRET` fort.
5. Déployez (Vercel recommandé). Le build lance `prisma generate` automatiquement.

> Sur un hébergement serverless, SQLite n'est pas persistant : utilisez Postgres.

## Partager le site avec des amis (Cloudflare Tunnel)

Pour obtenir une **URL publique** (`https://xxxx.trycloudflare.com`) sans rien
déployer : le site tourne sur votre machine et `cloudflared` l'expose via le
réseau Cloudflare. Aucun compte Cloudflare requis, aucune migration de base.

**1. Installer `cloudflared`** (une seule fois) :

```bash
# Windows (PowerShell)
winget install --id Cloudflare.cloudflared -e
# macOS
brew install cloudflared
# Linux : voir https://pkg.cloudflare.com/ (paquet cloudflared)
```

> Sous Windows, rouvrez le terminal après l'installation pour rafraîchir le PATH.

**2. Lancer le site en production** (plus stable que `npm run dev`) :

```bash
npm run build
npm start            # sert le site sur http://localhost:3000
```

**3. Ouvrir le tunnel** (dans un second terminal, en laissant le site tourner) :

```bash
cloudflared tunnel --url http://localhost:3000
```

`cloudflared` affiche alors l'URL publique à partager, par exemple :

```
+--------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                  |
|  https://belong-tank-webpage-nyc.trycloudflare.com                 |
+--------------------------------------------------------------------+
```

**À savoir :**

- **URL éphémère** : elle change à chaque relance de `cloudflared`. Tant que les
  deux processus (`npm start` **et** `cloudflared`) tournent, le lien reste valide.
- **Votre PC = le serveur** : si la machine s'éteint ou se met en veille, le lien
  tombe. Pour arrêter le partage, coupez le process `cloudflared` (puis `npm start`).
- **Sécurité** : l'URL étant publique, n'importe qui peut ouvrir `/admin/login`.
  Avant de diffuser largement, changez le mot de passe admin et retirez l'indice de
  démo affiché sur la page de connexion.

> Besoin d'un lien permanent (24/7) ? Il faut un vrai hébergement : soit Vercel +
> Postgres (cf. section précédente), soit Cloudflare Pages/Workers via l'adaptateur
> OpenNext **avec** migration de SQLite vers Cloudflare D1 ou Neon.

## Médias

Les images et vidéos sont référencées par **URL** (pas d'upload). Pour une vidéo,
utilisez une URL d'**embed** (ex. `https://www.youtube.com/embed/ID`). Si une
image casse, un dégradé stylisé portant le nom du lieu s'affiche à la place.

Dans l'éditeur, le champ médias d'une étape attend un tableau JSON :

```json
[
  { "type": "image", "url": "https://…", "caption": "Légende" },
  { "type": "video", "url": "https://www.youtube.com/embed/…" }
]
```

## Structure

```
prisma/            schéma + seeds : seed.ts (Islande) et seed-<slug>.ts par voyage
src/app/           pages (accueil, /voyage/[slug], /admin/*) + API
src/components/    Hero, RouteMap, DaySection, OptionToggle, TotalBar, Recap…
src/lib/           prisma, auth (session JWT), trips, format
```

## Ajouter un voyage à partir d'un PDF (avec Claude Code)

Les voyages Albanie, Bulgarie et Hurghada ont été créés ainsi : on fournit un PDF
décrivant le voyage et on laisse Claude Code le transformer en données conformes
au schéma, sans toucher au design.

**Marche à suivre :**

1. Placez le descriptif du voyage à la racine du projet, nommé **`PLAN.pdf`**.
2. Ouvrez Claude Code dans le dossier du projet.
3. Joignez `PLAN.pdf` à la conversation et collez le prompt ci-dessous.
4. À la fin, Claude aura créé `prisma/seed-<slug>.ts` + un script
   `npm run db:seed:<slug>` ; relancez le build/serveur pour voir le voyage.

> Convention maison appliquée par les seeds existants : prix **en centimes**,
> coordonnées `lat`/`lng` réelles (sinon la carte ne trace pas), photos libres
> **Wikimedia Commons** servies via
> `https://commons.wikimedia.org/wiki/Special:FilePath/<Fichier>?width=1600`
> (vignette légère, et fallback dégradé si l'URL casse).

**Prompt à donner à Claude Code :**

```text
Contexte
Tu travailles dans le projet « carnet-voyage » déjà présent dans ce dossier : un
site Next.js 15 (App Router) + TypeScript + Prisma/SQLite qui présente des voyages
en scrollytelling — une carte Leaflet trace l'itinéraire au fil du défilement,
chaque journée s'illustre de photos/vidéos, et le visiteur coche des options qui
mettent à jour un total visible + un récapitulatif final. AVANT TOUTE CHOSE, lis
README.md, prisma/schema.prisma, prisma/seed.ts et explore src/components et
src/lib pour t'imprégner de l'architecture et des conventions exactes.

Ta mission
À partir du plan de voyage fourni dans PLAN.pdf (à la racine), créer UN NOUVEAU
voyage dans l'application, avec EXACTEMENT le même rendu, le même design et les
mêmes fonctionnalités que l'existant. Tu n'inventes aucune nouvelle interface : tu
réutilises tels quels les composants, le design system et le modèle de données. Ton
travail consiste uniquement à transformer le PDF en données conformes au schéma,
puis à les insérer.

Étapes
1. Lis et extrais le contenu de PLAN.pdf (texte ; si c'est un scan, fais de l'OCR).
   Reconstitue : titre du voyage, sous-titre, intro, puis la liste ordonnée des
   journées/étapes avec, pour chacune : le jour, le lieu, un titre, un récit, les
   activités, et les prix s'ils figurent.
2. Mappe ces données sur le modèle Prisma (cf. prisma/schema.prisma) :
   - Trip : slug en kebab-case, title, subtitle, intro, heroImage (URL), currency
     "EUR", published true.
   - Step (une par étape, order croissant depuis 0) : day (ex. "Jour 03"), place,
     lat/lng OBLIGATOIRES (récupère les coordonnées réelles de chaque lieu : c'est
     ce qui permet à la carte de tracer la route), title, description, basePrice
     (prix inclus au forfait, EN CENTIMES), media.
   - Option (expériences cochables) : label, description, price (EN CENTIMES),
     selectedByDefault (mets-en 1 ou 2 en avant par voyage), order. Les activités
     optionnelles / à la carte du PDF deviennent des Options ; ce qui est inclus
     devient le basePrice de l'étape.
   - media : tableau JSON au format EXACT
     [{ "type":"image"|"video", "url":"…", "caption":"…" }]. Choisis 1 à 2 visuels
     pertinents par étape (URLs d'images libres type Unsplash, ou une vidéo en URL
     d'embed YouTube).
   - TOUS les prix en centimes (12000 = 120 €).
3. Écris un script d'insertion prisma/seed-<slug>.ts calqué sur prisma/seed.ts mais
   qui N'EFFACE PAS les données existantes : il crée seulement ce nouveau voyage (et
   garantit la présence de l'admin si besoin). Ajoute un script npm "db:seed:<slug>"
   qui l'exécute via tsx.
4. Applique : npm install si nécessaire, npx prisma db push, puis lance ton script.
5. Vérifie la compilation : npm run build doit passer. Corrige toute erreur de type.

Contraintes impératives
- NE MODIFIE NI le design, NI les composants, NI le comportement. Aucune nouvelle
  police, couleur ou mise en page. Tu ajoutes uniquement du contenu : un voyage.
- Garde le voyage de démo « Islande » intact.
- lat/lng réels et cohérents pour chaque étape (sinon la carte ne trace rien).
- Récit en français, ton éditorial soigné et fidèle au PDF (n'invente pas
  d'activités absentes ; tu peux en revanche enrichir la rédaction).
- Si une info manque dans le PDF (prix, coordonnée, visuel), choisis une valeur
  plausible ET liste-la dans ton rapport final pour que je la valide.

Rapport final attendu
- Le slug et l'URL du nouveau voyage (/voyage/<slug>).
- Un résumé : nombre d'étapes, total forfait, options créées.
- La liste des hypothèses / valeurs que tu as comblées toi-même.
- La confirmation que npm run build passe.
```
