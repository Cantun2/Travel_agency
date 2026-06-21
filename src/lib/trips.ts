import "server-only";
import { prisma } from "./prisma";
import { parseMedia } from "./types";
import type { TripData } from "@/components/VoyageExperience";

export async function getTripBySlug(slug: string): Promise<TripData | null> {
  const trip = await prisma.trip.findUnique({
    where: { slug },
    include: {
      steps: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!trip || !trip.published) return null;

  return {
    id: trip.id,
    slug: trip.slug,
    title: trip.title,
    subtitle: trip.subtitle,
    intro: trip.intro,
    heroImage: trip.heroImage,
    currency: trip.currency,
    steps: trip.steps.map((s) => ({
      id: s.id,
      day: s.day,
      place: s.place,
      lat: s.lat,
      lng: s.lng,
      title: s.title,
      description: s.description,
      basePrice: s.basePrice,
      media: parseMedia(s.media),
      options: s.options.map((o) => ({
        id: o.id,
        label: o.label,
        description: o.description,
        price: o.price,
        selectedByDefault: o.selectedByDefault,
      })),
    })),
  };
}

export async function listPublishedTrips() {
  return prisma.trip.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      slug: true,
      title: true,
      subtitle: true,
      heroImage: true,
      _count: { select: { steps: true } },
    },
  });
}
