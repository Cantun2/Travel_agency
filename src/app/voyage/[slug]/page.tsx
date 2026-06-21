import { notFound } from "next/navigation";
import { getTripBySlug } from "@/lib/trips";
import { VoyageExperience } from "@/components/VoyageExperience";

export const dynamic = "force-dynamic";

export default async function VoyagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) notFound();
  return <VoyageExperience trip={trip} />;
}
