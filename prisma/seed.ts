import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Petite aide : image Unsplash. Si l'URL casse côté client, le composant média
// affiche un dégradé stylisé avec le nom du lieu (jamais d'image cassée).
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1700&q=80`;

async function main() {
  console.log("→ Réinitialisation…");
  await prisma.selection.deleteMany();
  await prisma.option.deleteMany();
  await prisma.step.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.admin.deleteMany();

  // --- Admin ---
  const passwordHash = await bcrypt.hash("voyage123", 10);
  await prisma.admin.create({
    data: { email: "admin@voyage.test", passwordHash },
  });
  console.log("→ Admin : admin@voyage.test / voyage123");

  // --- Voyage Islande ---
  const trip = await prisma.trip.create({
    data: {
      slug: "islande-cote-sud",
      title: "Islande, la côte sauvage du Sud",
      subtitle: "Sept jours entre cascades, glaciers et plages noires",
      intro:
        "De Reykjavík aux lagons de glace, un fil tracé le long de la route 1. Chaque journée révèle une terre encore en formation — geysers, chutes, sable volcanique. Faites défiler : votre itinéraire se dessine, et vous composez les expériences qui seront les vôtres.",
      heroImage: img("1504829857797-ddff29c27927"),
      currency: "EUR",
      published: true,
      steps: {
        create: [
          {
            order: 0,
            day: "Jour 01",
            place: "Reykjavík",
            lat: 64.1466,
            lng: -21.9426,
            title: "Arrivée dans la capitale du bout du monde",
            description:
              "Maisons de tôle colorées, air iodé et lumière rasante. On prend le pouls de la plus septentrionale des capitales avant de filer vers les terres.",
            basePrice: 0,
            media: JSON.stringify([
              { type: "image", url: img("1504829857797-ddff29c27927"), caption: "Reykjavík au crépuscule" },
              { type: "image", url: img("1534430480872-3498386e7856"), caption: "Hallgrímskirkja" },
            ]),
            options: {
              create: [
                { label: "Bain géothermal au Blue Lagoon", description: "Accès premium, serviette et boisson incluses.", price: 9500, selectedByDefault: true, order: 0 },
                { label: "Dîner dégustation islandais", description: "Menu en 5 services, produits de la mer.", price: 7800, order: 1 },
              ],
            },
          },
          {
            order: 1,
            day: "Jour 02",
            place: "Parc national de Þingvellir",
            lat: 64.2559,
            lng: -21.1295,
            title: "La faille entre deux continents",
            description:
              "Marche au creux du rift où les plaques nord-américaine et eurasienne s'écartent. Lieu de naissance du plus vieux parlement du monde.",
            basePrice: 4500,
            media: JSON.stringify([
              { type: "image", url: img("1505765050516-f72dcac9c60e"), caption: "La faille d'Almannagjá" },
            ]),
            options: {
              create: [
                { label: "Plongée dans la faille de Silfra", description: "Entre deux continents, eau à 2°C, combinaison sèche.", price: 18900, order: 0 },
              ],
            },
          },
          {
            order: 2,
            day: "Jour 03",
            place: "Geysir, vallée de Haukadalur",
            lat: 64.3104,
            lng: -20.3024,
            title: "La terre respire",
            description:
              "Strokkur jaillit toutes les quelques minutes, panache d'eau bouillante de vingt mètres. Le sol fume, l'odeur de soufre rappelle où l'on est.",
            basePrice: 3200,
            media: JSON.stringify([
              { type: "image", url: img("1531168556467-80aace0d0144"), caption: "Éruption de Strokkur" },
              { type: "video", url: "https://www.youtube.com/embed/Vt6P_lYFnps", caption: "Le geyser en action" },
            ]),
            options: {
              create: [
                { label: "Balade à cheval islandais", description: "Le tölt, allure unique de la race locale.", price: 8900, order: 0 },
              ],
            },
          },
          {
            order: 3,
            day: "Jour 04",
            place: "Gullfoss",
            lat: 64.3271,
            lng: -20.1199,
            title: "La chute d'or",
            description:
              "Deux paliers, un canyon, des arcs-en-ciel suspendus dans l'écume. L'une des plus puissantes cascades d'Europe.",
            basePrice: 2800,
            media: JSON.stringify([
              { type: "image", url: img("1516026672322-bc52d61a55d5"), caption: "Gullfoss en crue" },
            ]),
            options: {
              create: [
                { label: "Survol en hélicoptère", description: "30 min au-dessus des chutes et du glacier Langjökull.", price: 32000, order: 0 },
                { label: "Motoneige sur le glacier", description: "Accompagné, équipement fourni.", price: 19500, order: 1 },
              ],
            },
          },
          {
            order: 4,
            day: "Jour 05",
            place: "Vík í Mýrdal",
            lat: 63.4194,
            lng: -19.006,
            title: "Sable noir et orgues de basalte",
            description:
              "Reynisfjara, sa plage d'obsidienne et ses colonnes hexagonales. Au large, les aiguilles de Reynisdrangar percent la brume.",
            basePrice: 5200,
            media: JSON.stringify([
              { type: "image", url: img("1529963183134-61a90db47eaf"), caption: "Plage de Reynisfjara" },
              { type: "image", url: img("1551582045-6ec9c11d8697"), caption: "Orgues basaltiques" },
            ]),
            options: {
              create: [
                { label: "Randonnée glaciaire sur Sólheimajökull", description: "Crampons et piolet, guide certifié.", price: 11900, selectedByDefault: true, order: 0 },
              ],
            },
          },
          {
            order: 5,
            day: "Jour 06",
            place: "Parc de Skaftafell",
            lat: 64.0159,
            lng: -16.9667,
            title: "Au pied du plus grand glacier d'Europe",
            description:
              "Sentiers vers Svartifoss, cascade encadrée d'orgues noirs, et points de vue sur la calotte du Vatnajökull.",
            basePrice: 4100,
            media: JSON.stringify([
              { type: "image", url: img("1500534623283-312aade485b7"), caption: "Svartifoss" },
            ]),
            options: {
              create: [
                { label: "Exploration de grotte de glace", description: "Bleu électrique, sous le glacier. Saison hivernale.", price: 14500, order: 0 },
              ],
            },
          },
          {
            order: 6,
            day: "Jour 07",
            place: "Lagon glaciaire de Jökulsárlón",
            lat: 64.0784,
            lng: -16.2306,
            title: "Les icebergs et la plage de diamants",
            description:
              "Des blocs de glace millénaire dérivent vers l'océan puis s'échouent, étincelants, sur le sable noir de Diamond Beach. Point final, et sommet, du voyage.",
            basePrice: 6400,
            media: JSON.stringify([
              { type: "image", url: img("1490682143684-14369e18dce8"), caption: "Icebergs du lagon" },
              { type: "image", url: img("1486911278844-a81c5267e227"), caption: "Diamond Beach" },
            ]),
            options: {
              create: [
                { label: "Croisière amphibie entre les icebergs", description: "Au plus près de la glace, dégustation incluse.", price: 9900, selectedByDefault: true, order: 0 },
                { label: "Chasse aux aurores boréales", description: "Sortie nocturne guidée, photographe sur place.", price: 8500, order: 1 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`→ Voyage créé : ${trip.title} (/voyage/${trip.slug})`);
  console.log("✓ Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
