import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Photos : Wikimedia Commons (libres, stables). Special:FilePath redirige vers le
// fichier et `width` renvoie une vignette redimensionnée (pages légères). Si une URL
// casse côté client, le MediaFrame affiche un dégradé stylisé (jamais d'image cassée).
const wiki = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1600`;

const SLUG = "albanie-riviera-sud";

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
      title: "Albanie, la Riviera sauvage du Sud",
      subtitle: "Cinq jours entre plages turquoise, villages ottomans et cités antiques",
      intro:
        "De Tirana à Ksamil, un road trip qui descend la côte sud par le col de Llogara avant de remonter par les cités UNESCO. Mer Ionienne d'un bleu irréel, criques accessibles à pied, ruines antiques et ruelles pavées ottomanes. Les prix affichés s'entendent par personne, base deux voyageurs : un socle (vol, voiture, nuitées) puis les expériences que vous composez. Faites défiler : la route se dessine.",
      heroImage: wiki("Llogara_pass.jpg"),
      currency: "EUR",
      published: true,
      steps: {
        create: [
          {
            order: 0,
            day: "Jour 01",
            place: "Col de Llogara",
            lat: 40.2078,
            lng: 19.5942,
            title: "Le balcon de la Riviera",
            description:
              "Atterrissage à Tirana, récupération de la voiture, puis cap au sud-ouest. La route grimpe jusqu'au col de Llogara, à plus de mille mètres, où la forêt de pins s'ouvre d'un coup sur la mer Ionienne : l'un des panoramas les plus spectaculaires des Balkans. On bascule ensuite en lacets vers la côte pour rejoindre Himarë, premier village de pierre face au large, où l'on pose les valises pour la nuit.",
            basePrice: 32500, // socle : vol A/R Beauvais–Tirana + voiture & carburant + 1re nuit (par pers.)
            media: JSON.stringify([
              { type: "image", url: wiki("Llogara_pass.jpg"), caption: "Panorama du col de Llogara" },
            ]),
            options: {
              create: [
                { label: "Parapente biplace au col de Llogara", description: "Vol en tandem face à la Riviera avec un pilote certifié, transfert au décollage et vidéo embarquée.", price: 10000, order: 0 },
                { label: "Dîner de poisson grillé à Himarë", description: "Taverne en bord de mer, pêche du jour et vin local.", price: 2200, order: 1 },
              ],
            },
          },
          {
            order: 1,
            day: "Jour 02",
            place: "Dhërmi & Gjipe",
            lat: 40.1556,
            lng: 19.644,
            title: "Les criques turquoise",
            description:
              "Journée plages sur la Riviera. Dhërmi et ses galets clairs léchés par une eau translucide, puis la crique sauvage de Gjipe, nichée à l'embouchure d'un canyon et que l'on rejoint à pied par un sentier, loin des routes. On enchaîne avec Jale pour la baignade et le farniente, masque et tuba à portée de main.",
            basePrice: 2500, // nuitée (par pers.)
            media: JSON.stringify([
              { type: "image", url: wiki("Dhërmi_-_Beach.JPG"), caption: "La plage de Dhërmi" },
              { type: "image", url: wiki("Gjipe_beach,_Albania.JPG"), caption: "La crique de Gjipe" },
            ]),
            options: {
              create: [
                { label: "Location de paddle & kayak à Dhërmi", description: "Demi-journée pour explorer à la rame les criques voisines.", price: 2000, selectedByDefault: true, order: 0 },
                { label: "Excursion en bateau vers les grottes marines", description: "Sortie partagée vers les grottes et plages inaccessibles par la route.", price: 3500, order: 1 },
              ],
            },
          },
          {
            order: 2,
            day: "Jour 03",
            place: "Ksamil",
            lat: 39.7667,
            lng: 20.0006,
            title: "Les Maldives albanaises",
            description:
              "Route plein sud vers Ksamil, pointe la plus méridionale de la Riviera. Face à la plage, des îlots posés sur une eau peu profonde et limpide que l'on rejoint à la nage en quelques brasses, sable blanc et fonds turquoise. En fin de journée, cap sur le port animé de Sarandë pour le coucher de soleil et le dîner.",
            basePrice: 2500, // nuitée (par pers.)
            media: JSON.stringify([
              { type: "image", url: wiki("Ksamil_Islets_-_Vlorë_County_-_Southern_Albania_-_5_July_2011.jpg"), caption: "Les îlots de Ksamil" },
              { type: "image", url: wiki("Saranda_Albania_Promenade_2016.jpg"), caption: "Le front de mer de Sarandë" },
            ]),
            options: {
              create: [
                { label: "Transat & parasol face aux îlots", description: "Place réservée sur la plage de Ksamil pour la journée.", price: 1000, order: 0 },
                { label: "Croisière coucher de soleil à Sarandë", description: "Sortie en mer avec apéritif à bord, le long de la côte ionienne.", price: 3000, selectedByDefault: true, order: 1 },
              ],
            },
          },
          {
            order: 3,
            day: "Jour 04",
            place: "Gjirokastër",
            lat: 40.0758,
            lng: 20.1389,
            title: "Cités antiques et pierre ottomane",
            description:
              "Grande journée patrimoine. Butrint au matin, cité antique classée à l'UNESCO posée entre lagune et marais, où se superposent théâtre grec, thermes romains et baptistère paléochrétien. Le Blue Eye (Syri i Kaltër) à la mi-journée, source karstique d'un bleu saturé jaillissant des profondeurs. Puis remontée vers Gjirokastër, ville-musée ottomane aux toits de lauzes, dominée par son imposant château, pour la nuit.",
            basePrice: 4000, // nuitée + entrées Butrint, Blue Eye & château (par pers.)
            media: JSON.stringify([
              { type: "image", url: wiki("Butrint_archaeological_site.jpg"), caption: "Les ruines de Butrint" },
              { type: "image", url: wiki("Syri_i_Kalter.jpg"), caption: "Le Blue Eye, Syri i Kaltër" },
              { type: "image", url: wiki("Gjirokastër_Castle_(by_Pudelek)_4_-_Clock_Tower.JPG"), caption: "Le château de Gjirokastër" },
            ]),
            options: {
              create: [
                { label: "Visite guidée de la cité antique de Butrint", description: "Théâtre grec, baptistère et lecture des 2500 ans du site avec un guide.", price: 3500, order: 0 },
                { label: "Dégustation de raki & repas traditionnel", description: "Eaux-de-vie maison et mezze dans une taverne de pierre.", price: 1500, order: 1 },
              ],
            },
          },
          {
            order: 4,
            day: "Jour 05",
            place: "Tirana",
            lat: 41.3275,
            lng: 19.8187,
            title: "Retour par la capitale",
            description:
              "Remontée vers Tirana (environ trois heures et demie de route). Si le vol part en soirée, le temps d'un tour de la place Skanderbeg, cœur battant de la capitale bordé de façades colorées et du Musée national, avant de rendre la voiture et de s'envoler.",
            basePrice: 0, // jour de départ, pas de nuitée
            media: JSON.stringify([
              { type: "image", url: wiki("Tirana_-_Skanderbeg_Square_(Sheshi_Skënderbej)_-_by_Pudelek.jpg"), caption: "La place Skanderbeg, Tirana" },
            ]),
            options: {
              create: [
                { label: "Musée Bunk'Art", description: "Bunker antiatomique reconverti en parcours d'histoire du XXe siècle albanais.", price: 1100, order: 0 },
                { label: "Téléphérique du Dajti (Dajti Ekspres)", description: "Montée en cabine au-dessus de la ville pour un dernier panorama.", price: 1500, order: 1 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`→ Voyage créé : ${trip.title} (/voyage/${trip.slug})`);
  console.log("✓ Seed Albanie terminé (Islande et autres voyages intacts).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
