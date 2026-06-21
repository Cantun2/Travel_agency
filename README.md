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
prisma/            schéma + seed (voyage Islande)
src/app/           pages (accueil, /voyage/[slug], /admin/*) + API
src/components/    Hero, RouteMap, DaySection, OptionToggle, TotalBar, Recap…
src/lib/           prisma, auth (session JWT), trips, format
```
