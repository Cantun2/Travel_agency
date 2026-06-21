# Travel Journal — immersive itineraries

A site that presents trips as immersive itineraries: the map draws the route as
you scroll, each day unfolds with photos, videos and prices, and the visitor
composes their experiences while the estimate updates live.

- **Visitor side**: reading + selecting checkable options → running total and
  summary (with a quote request).
- **Admin side**: create multiple trips, edit steps, media, prices and options,
  publish.

> Note: the trips themselves (Iceland, Albania, Bulgaria, Hurghada) are written in
> French on purpose — this documentation is in English so the app can be reused
> universally.

## Stack

Next.js 15 (App Router) · TypeScript · Prisma · SQLite (dev) / PostgreSQL (prod)
· JWT session authentication (httpOnly cookie, bcrypt-hashed passwords) · Leaflet
+ CARTO dark basemap (no API key) · Framer Motion · Tailwind CSS.

## Local setup

```bash
npm install
cp .env .env.local        # or keep .env as-is for development
npx prisma db push        # creates the SQLite database (dev.db)
npm run db:seed           # loads the demo Iceland trip + the admin account
npm run dev
```

- Site: http://localhost:3000
- Demo trip: http://localhost:3000/voyage/islande-cote-sud
- Admin: http://localhost:3000/admin → **admin@voyage.test / voyage123**

> Reset the data: `npm run db:reset`

### Load all the sample trips

`npm run db:seed` only loads Iceland. To get **all four trips**, also run (after
`npx prisma db push`):

```bash
npm run db:seed             # Islande (resets the database + admin)
npm run db:seed:albanie     # Albanie, la Riviera sauvage du Sud
npm run db:seed:bulgarie    # Bulgarie, Sofia et les montagnes de Rila
npm run db:seed:hurghada    # Croisière plongée — Best of Hurghada
```

Each `db:seed:<slug>` is **idempotent**: it only recreates its own trip (without
deleting the others) and ensures the admin account exists.

## Environment variables

| Variable       | Purpose                                                    |
| -------------- | ---------------------------------------------------------- |
| `DATABASE_URL` | Database connection. SQLite in dev, Postgres in prod.      |
| `AUTH_SECRET`  | Session signing secret. **Change it in production** (`openssl rand -base64 32`). |

## Going to production (PostgreSQL)

1. In `prisma/schema.prisma`, replace `provider = "sqlite"` with
   `provider = "postgresql"`.
2. Point `DATABASE_URL` at your database (Neon, Supabase, Vercel Postgres…).
3. `npx prisma db push` then `npm run db:seed` (optional).
4. Set a strong `AUTH_SECRET`.
5. Deploy (Vercel recommended). The build runs `prisma generate` automatically.

> On serverless hosting, SQLite is not persistent: use Postgres.

## Share the site with friends (Cloudflare Tunnel)

To get a **public URL** (`https://xxxx.trycloudflare.com`) without deploying
anything: the site runs on your machine and `cloudflared` exposes it through the
Cloudflare network. No Cloudflare account required, no database migration.

**1. Install `cloudflared`** (once):

```bash
# Windows (PowerShell)
winget install --id Cloudflare.cloudflared -e
# macOS
brew install cloudflared
# Linux: see https://pkg.cloudflare.com/ (cloudflared package)
```

> On Windows, reopen the terminal after installation to refresh the PATH.

**2. Run the site in production** (more stable than `npm run dev`):

```bash
npm run build
npm start            # serves the site on http://localhost:3000
```

**3. Open the tunnel** (in a second terminal, leaving the site running):

```bash
cloudflared tunnel --url http://localhost:3000
```

`cloudflared` then prints the public URL to share, for example:

```
+--------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                  |
|  https://belong-tank-webpage-nyc.trycloudflare.com                 |
+--------------------------------------------------------------------+
```

**Good to know:**

- **Ephemeral URL**: it changes every time you restart `cloudflared`. As long as
  both processes (`npm start` **and** `cloudflared`) are running, the link stays
  valid.
- **Your PC is the server**: if the machine shuts down or sleeps, the link goes
  down. To stop sharing, kill the `cloudflared` process (then `npm start`).
- **Security**: since the URL is public, anyone can open `/admin/login`. Before
  sharing widely, change the admin password and remove the demo hint shown on the
  login page.

> Need a permanent (24/7) link? You need real hosting: either Vercel + Postgres
> (see the previous section), or Cloudflare Pages/Workers via the OpenNext adapter
> **with** a migration from SQLite to Cloudflare D1 or Neon.

## Media

Images and videos are referenced by **URL** (no upload). For a video, use an
**embed** URL (e.g. `https://www.youtube.com/embed/ID`). If an image fails to
load, a styled gradient bearing the place name is shown instead.

In the editor, a step's media field expects a JSON array:

```json
[
  { "type": "image", "url": "https://…", "caption": "Caption" },
  { "type": "video", "url": "https://www.youtube.com/embed/…" }
]
```

## Structure

```
prisma/            schema + seeds: seed.ts (Iceland) and one seed-<slug>.ts per trip
src/app/           pages (home, /voyage/[slug], /admin/*) + API
src/components/    Hero, RouteMap, DaySection, OptionToggle, TotalBar, Recap…
src/lib/           prisma, auth (JWT session), trips, format
```

## Add a trip from a PDF (with Claude Code)

The Albania, Bulgaria and Hurghada trips were created this way: you provide a PDF
describing the trip and let Claude Code turn it into data that conforms to the
schema, without touching the design.

**How to do it:**

1. Put the trip description at the project root, named **`PLAN.pdf`**.
2. Open Claude Code in the project folder.
3. Attach `PLAN.pdf` to the conversation and paste the prompt below.
4. When done, Claude will have created `prisma/seed-<slug>.ts` + an
   `npm run db:seed:<slug>` script; restart the build/server to see the trip.

> House conventions applied by the existing seeds: prices **in cents**, real
> `lat`/`lng` coordinates (otherwise the map won't draw), free **Wikimedia
> Commons** photos served via
> `https://commons.wikimedia.org/wiki/Special:FilePath/<File>?width=1600`
> (lightweight thumbnail, with a gradient fallback if the URL breaks).

**Prompt to give Claude Code** (in French — it produces French trip content to
match the bundled trips; adapt it to another language if you prefer):

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
