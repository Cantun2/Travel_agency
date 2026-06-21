import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Photos : Wikimedia Commons (libres, stables). Special:FilePath redirige vers le
// fichier et `width` renvoie une vignette redimensionnée (pages légères). Si une URL
// casse côté client, le MediaFrame affiche un dégradé stylisé (jamais d'image cassée).
const wiki = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1600`;

const SLUG = "croisiere-plongee-hurghada";

async function main() {
  // Garantit la présence de l'admin sans toucher aux autres données.
  const passwordHash = await bcrypt.hash("voyage123", 10);
  await prisma.admin.upsert({
    where: { email: "admin@voyage.test" },
    update: {},
    create: { email: "admin@voyage.test", passwordHash },
  });

  // Idempotent : on ne supprime QUE ce voyage (cascade sur ses étapes/options),
  // jamais les autres voyages.
  await prisma.trip.deleteMany({ where: { slug: SLUG } });

  const trip = await prisma.trip.create({
    data: {
      slug: SLUG,
      title: "Croisière plongée — Best of Hurghada",
      subtitle: "Trois nuits en mer Rouge, des jardins de corail aux épaves d'Abu Nuhas",
      intro:
        "Quatre jours, trois nuits à bord de l'Amelie pour enchaîner les plus beaux spots accessibles depuis Hurghada : jardins de corail des Giftun, densité folle de « l'Aquarium » de Gota Abu Ramada, et le cimetière d'épaves d'Abu Nuhas. Nitrox et pension complète inclus, accessible dès le niveau Open Water. Les prix s'entendent par personne, cabine twin, base deux plongeurs ; une nuit à terre est ajoutée pour respecter la règle des 24 h avant l'avion. Faites défiler : l'itinéraire se dessine, et vous composez vos options.",
      heroImage: wiki("Red sea coral reef.jpg"),
      currency: "EUR",
      published: true,
      steps: {
        create: [
          {
            order: 0,
            day: "Jour 01",
            place: "Marina d'Hurghada",
            lat: 27.2285,
            lng: 33.843,
            title: "Embarquement sur l'Amelie",
            description:
              "Vol Paris → Hurghada (environ 5 h), transfert au port inclus. Embarquement sur l'Amelie en début d'après-midi, installation en cabine, briefing sécurité puis dîner. Au coucher du soleil, un éventuel check-dive pour régler le lestage et retrouver ses sensations avant la grande journée du lendemain.",
            basePrice: 65300, // socle/pers : vol A/R Paris–Hurghada (août) + visa + part croisière (cabine + Nitrox + pension + taxes obligatoires)
            media: JSON.stringify([
              { type: "image", url: wiki("Hurghada Marina for yachts.jpg"), caption: "La marina d'Hurghada" },
              { type: "image", url: wiki("Tauchsafari Rotes Meer Auf Der Seven Seas (67952293).jpeg"), caption: "Un bateau de croisière plongée en mer Rouge" },
            ]),
            options: {
              create: [
                { label: "Assurance plongée", description: "Recommandée (parfois exigée à bord) : couverture spécifique accidents de plongée.", price: 3500, selectedByDefault: true, order: 0 },
                { label: "Location du matériel de plongée complet", description: "Détendeur, gilet, combinaison, ordinateur pour toute la croisière.", price: 11000, order: 1 },
                { label: "Passer son Open Water à bord", description: "Pour le non-certifié du binôme : brevet PADI/SSI Open Water encadré pendant la croisière.", price: 29000, order: 2 },
              ],
            },
          },
          {
            order: 1,
            day: "Jour 02",
            place: "Gota Abu Ramada",
            lat: 27.1339,
            lng: 33.9211,
            title: "Plein gaz : jardins de corail et « l'Aquarium »",
            description:
              "Trois à quatre plongées sur le meilleur des récifs d'Hurghada. Les jardins de corail des îles Giftun, peuplés de tortues et de raies ; Gota Abu Ramada, surnommée « l'Aquarium » pour son incroyable densité de poissons, paradis des photographes ; et El Fanadir, long récif coloré idéal pour la mise en jambe. Poissons-clowns, Napoléons, murènes et bancs de carangues au programme.",
            basePrice: 18000, // part croisière (journée de plongées, Nitrox & pension inclus)
            media: JSON.stringify([
              { type: "image", url: wiki("Giftoun Island near Hurghada.jpg"), caption: "L'île de Giftun" },
              { type: "image", url: wiki("Grupo de anthias cola de lira (Pseudanthias squamipinnis), parque nacional Ras Muhammad, Egipto, 2022-03-27, DD 88.jpg"), caption: "Nuée d'anthias, « l'Aquarium »" },
            ]),
            options: {
              create: [
                { label: "Plongée de nuit", description: "Sortie nocturne au lampe-torche : la faune change, le récif s'anime autrement.", price: 5000, order: 0 },
                { label: "Guide de plongée privé pour la journée", description: "Un guide rien que pour votre binôme, rythme et spots sur mesure.", price: 5500, order: 1 },
                { label: "Brevet Nitrox", description: "Spécialité plongée au mélange suroxygéné : temps de fond rallongés.", price: 13200, order: 2 },
              ],
            },
          },
          {
            order: 2,
            day: "Jour 03",
            place: "Épaves d'Abu Nuhas",
            lat: 27.5667,
            lng: 33.9167,
            title: "Le cimetière de navires de la mer Rouge",
            description:
              "Cap au nord vers Abu Nuhas, récif redouté des marins devenu paradis des plongeurs. Le Giannis D, cargo couché et déformé, et le Carnatic, voilier à vapeur du XIXe siècle envahi de gorgones, comptent parmi les épaves les plus photogéniques de la mer Rouge. On complète par un récif — Umm Gamar ou Shaab El Erg — où l'on croise parfois des dauphins.",
            basePrice: 18000, // part croisière (journée épaves & récif)
            media: JSON.stringify([
              { type: "image", url: wiki("Ship wreck Giannis D, duesterer Beilbauchfisch (Pempheris adusta) 2017-04-22 09-36-08 Egypt-7985.jpg"), caption: "L'épave du Giannis D" },
              { type: "image", url: wiki("Ship wreck Carnatic 2017-04-22 Egypt-7947.jpg"), caption: "Le Carnatic, voilier à vapeur" },
              { type: "image", url: wiki("A pod of spinner dolphins in the Red Sea.jpg"), caption: "Dauphins à long bec à Shaab El Erg" },
            ]),
            options: {
              create: [
                { label: "Plongée supplémentaire sur épave", description: "Une immersion de plus pour explorer une seconde épave d'Abu Nuhas.", price: 5000, order: 0 },
                { label: "Guide naturaliste", description: "Identification de la faune et conseils photo sous-marine.", price: 5000, order: 1 },
              ],
            },
          },
          {
            order: 3,
            day: "Jour 04",
            place: "El Gouna",
            lat: 27.4011,
            lng: 33.6781,
            title: "Débarquement et sas de décompression à terre",
            description:
              "Une à deux plongées tôt le matin, puis navigation retour et débarquement vers midi : à partir de là, plus aucune plongée, le compte à rebours « nofly » démarre. Check-in à l'hôtel (Hurghada ou El Gouna), vraie douche et piscine. Le soir, dîner de poisson frais et balade dans le vieux quartier d'El Dahar ou sur la marina — la décompression, version détente.",
            basePrice: 4500, // nuit d'hôtel à terre + dîner (par pers.)
            media: JSON.stringify([
              { type: "image", url: wiki("Peces payaso (Amphiprion bicinctus) en una anémona burbuja (Entacmaea quadricolor), mar Rojo, Egipto, 2023-04-14, DD 32.jpg"), caption: "Poissons-clowns de la mer Rouge" },
              { type: "image", url: wiki("El Gouna 02.jpg"), caption: "La marina d'El Gouna" },
            ]),
            options: {
              create: [
                { label: "Pourboires équipage (~10 %)", description: "Usage à bord : remerciement à l'équipage et aux guides pour la croisière.", price: 4000, selectedByDefault: true, order: 0 },
                { label: "Excursion terrestre", description: "Souks et cafés du vieux quartier d'El Dahar, ou marina d'Hurghada.", price: 3500, order: 1 },
                { label: "Demi-journée snorkeling guidé", description: "Pour le binôme qui préfère rester en surface ce jour-là.", price: 5000, order: 2 },
              ],
            },
          },
          {
            order: 4,
            day: "Jour 05",
            place: "Aéroport d'Hurghada",
            lat: 27.1783,
            lng: 33.7994,
            title: "Vol retour, l'esprit tranquille",
            description:
              "Transfert aéroport et vol retour vers Paris. Plus de 24 h se sont écoulées depuis la dernière plongée : le choix prudent face à la règle des 18 h minimum recommandée par DAN après des plongées répétitives. On rentre avec des images plein la tête, sans risque.",
            basePrice: 0, // vol retour déjà compté dans le socle du Jour 01
            media: JSON.stringify([
              { type: "image", url: wiki("Red sea coral reef.jpg"), caption: "Un dernier bleu, gravé en mémoire" },
            ]),
          },
        ],
      },
    },
  });

  console.log(`→ Voyage créé : ${trip.title} (/voyage/${trip.slug})`);
  console.log("✓ Seed Hurghada terminé (autres voyages intacts).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
