import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Photos : Wikimedia Commons (libres, stables). Special:FilePath redirige vers le
// fichier et `width` renvoie une vignette redimensionnée (pages légères). Si une URL
// casse côté client, le MediaFrame affiche un dégradé stylisé (jamais d'image cassée).
const wiki = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1600`;

const SLUG = "bulgarie-sofia-rila";

async function main() {
  // Garantit la présence de l'admin sans toucher aux autres données.
  const passwordHash = await bcrypt.hash("voyage123", 10);
  await prisma.admin.upsert({
    where: { email: "admin@voyage.test" },
    update: {},
    create: { email: "admin@voyage.test", passwordHash },
  });

  // Idempotent : on ne supprime QUE ce voyage (cascade sur ses étapes/options),
  // jamais l'Islande ni les autres.
  await prisma.trip.deleteMany({ where: { slug: SLUG } });

  const trip = await prisma.trip.create({
    data: {
      slug: SLUG,
      title: "Bulgarie, Sofia et les montagnes de Rila",
      subtitle: "Cinq jours entre monastère UNESCO, lacs d'altitude et villes d'art",
      intro:
        "Le choix malin sur cinq jours : la montagne à deux heures de l'aéroport, des routes carrossables et zéro change. De la capitale au monastère de Rila, de la rando signature des sept lacs jusqu'aux pavés de Plovdiv. Les prix affichés s'entendent par personne, base deux voyageurs : un socle (vol, voiture, nuitées) puis les expériences que vous composez. Faites défiler : la route se dessine.",
      heroImage: wiki("Rila_7_lakes_circus_panorama.jpg"),
      currency: "EUR",
      published: true,
      steps: {
        create: [
          {
            order: 0,
            day: "Jour 01",
            place: "Sofia",
            lat: 42.6977,
            lng: 23.3219,
            title: "Sofia, carrefour des empires",
            description:
              "Arrivée à Sofia et premier contact avec une capitale qui empile les époques. La cathédrale Alexandre-Nevski et ses coupoles dorées, mémorial néo-byzantin parmi les plus grands des Balkans ; les vestiges romains de Serdica affleurant sous les rues et le métro ; l'église Sainte-Sophie qui a donné son nom à la ville. Le soir, l'animation du boulevard Vitosha, ses terrasses et ses lumières.",
            basePrice: 24200, // socle : vol A/R Beauvais–Sofia + voiture & carburant + 1re nuit (par pers.)
            media: JSON.stringify([
              { type: "image", url: wiki("Alexander_Nevsky_Cathedral,_Sofia_(by_Pudelek).JPG"), caption: "La cathédrale Alexandre-Nevski" },
            ]),
            options: {
              create: [
                { label: "Visite guidée du centre historique", description: "Serdica, Sainte-Sophie et l'héritage thrace, romain et ottoman à pied.", price: 1800, order: 0 },
                { label: "Dégustation de vins bulgares", description: "Cépages locaux mavrud et rubin, accords fromages et charcuterie.", price: 2500, order: 1 },
              ],
            },
          },
          {
            order: 1,
            day: "Jour 02",
            place: "Monastère de Rila",
            lat: 42.134,
            lng: 23.3403,
            title: "Le monastère aux fresques",
            description:
              "Route vers le sud, au creux des montagnes de Rila, jusqu'au plus grand monastère orthodoxe de Bulgarie, joyau classé à l'UNESCO. Sous les galeries rayées de noir et blanc, l'église de la Nativité déploie des centaines de fresques flamboyantes ; le musée conserve la fameuse croix de Raphaël, sculptée de centaines de scènes minuscules. Continuation vers la base des lacs pour la nuit.",
            basePrice: 2500, // nuitée + don au monastère (par pers.)
            media: JSON.stringify([
              { type: "image", url: wiki("Rila_Monastery_(Рилски_манастир)_-_by_Pudelek.JPG"), caption: "La cour du monastère de Rila" },
              { type: "image", url: wiki("Religious_fresco_in_Rila_Monastery.jpg"), caption: "Les fresques de l'église" },
            ]),
            options: {
              create: [
                { label: "Visite guidée du monastère et du musée", description: "Histoire monastique et trésor sculpté de la croix de Raphaël.", price: 1800, order: 0 },
                { label: "Bains thermaux de Sapareva Banya", description: "Détente après la route près du seul geyser d'Europe continentale.", price: 1300, selectedByDefault: true, order: 1 },
              ],
            },
          },
          {
            order: 2,
            day: "Jour 03",
            place: "Sept lacs de Rila",
            lat: 42.2069,
            lng: 23.33,
            title: "Les sept lacs, la journée signature",
            description:
              "Télésiège depuis Panichishte, puis boucle d'altitude au-dessus des sept lacs glaciaires de Rila, étagés entre 2100 et 2500 mètres — du Larme, le plus haut, au Rein, au Trèfle et au Jumeau. Trois à cinq heures de marche selon le rythme, crêtes panoramiques et eaux miroir : l'une des plus belles randonnées du pays.",
            basePrice: 3800, // nuitée + télésiège aller-retour des 7 lacs (par pers.)
            media: JSON.stringify([
              { type: "image", url: wiki("Rila_7_lakes_circus_panorama.jpg"), caption: "Les sept lacs de Rila" },
            ]),
            options: {
              create: [
                { label: "Guide de montagne pour la boucle", description: "Accompagnement sur les crêtes et lecture du massif.", price: 4500, order: 0 },
                { label: "Pique-nique de produits locaux en altitude", description: "Banitsa, fromage de brebis et fruits, préparés pour la rando.", price: 600, selectedByDefault: true, order: 1 },
              ],
            },
          },
          {
            order: 3,
            day: "Jour 04",
            place: "Plovdiv",
            lat: 42.1354,
            lng: 24.7453,
            title: "Plovdiv, la vieille ville d'art",
            description:
              "Cap sur Plovdiv (environ deux heures), l'une des plus anciennes villes habitées d'Europe. Ruelles pavées et maisons colorées de la Renaissance bulgare sur la colline, théâtre romain du IIe siècle toujours en activité face aux montagnes, et le quartier créatif de Kapana, ses ateliers d'artistes et ses cafés. Le contraste parfait après la montagne.",
            basePrice: 2600, // nuitée + entrée du théâtre romain (par pers.)
            media: JSON.stringify([
              { type: "image", url: wiki("Ancient_theatre_plovdiv.jpg"), caption: "Le théâtre romain de Plovdiv" },
              { type: "image", url: wiki("Old_town_of_Plovdiv_02.jpg"), caption: "La vieille ville pavée" },
              { type: "image", url: wiki("Plovdiv_Kapana.jpg"), caption: "Le quartier Kapana" },
            ]),
            options: {
              create: [
                { label: "Concert au théâtre romain antique", description: "Représentation en soirée dans l'amphithéâtre du IIe siècle.", price: 3000, order: 0 },
                { label: "Tour des galeries du quartier Kapana", description: "Ateliers d'artistes, street art et cafés de créateurs.", price: 800, order: 1 },
              ],
            },
          },
          {
            order: 4,
            day: "Jour 05",
            place: "Sofia",
            lat: 42.6977,
            lng: 23.3219,
            title: "Derniers instants à Sofia",
            description:
              "Retour vers Sofia (environ une heure et demie). Derniers achats au marché central couvert, un café sur le boulevard Vitosha, puis envol. Si le vol le permet, une échappée au mont Vitosha, balcon naturel de la capitale, offre un dernier grand bol d'air et le panorama des Zlatni Mostove.",
            basePrice: 0, // jour de départ, pas de nuitée
            media: JSON.stringify([
              { type: "image", url: wiki("Bosque_del_monte_Vitosha,_Sofia,_Bulgaria,_mayo_de_2011.JPG"), caption: "Le mont Vitosha au-dessus de Sofia" },
            ]),
            options: {
              create: [
                { label: "Excursion au mont Vitosha", description: "Sentiers et rochers des Zlatni Mostove, le balcon de la capitale.", price: 1500, order: 0 },
                { label: "Brunch & souvenirs au marché central", description: "Halles couvertes (Tsentralni Hali) et produits locaux.", price: 1000, order: 1 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`→ Voyage créé : ${trip.title} (/voyage/${trip.slug})`);
  console.log("✓ Seed Bulgarie terminé (Islande et autres voyages intacts).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
