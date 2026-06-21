import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  tripId: z.string().min(1),
  optionIds: z.array(z.string()).default([]),
  total: z.number().int().nonnegative().default(0),
  contactName: z.string().max(200).nullable().optional(),
  contactEmail: z.string().email().max(200).nullable().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 422 });
  }

  const data = parsed.data;
  const trip = await prisma.trip.findUnique({ where: { id: data.tripId } });
  if (!trip) {
    return NextResponse.json({ error: "Voyage introuvable" }, { status: 404 });
  }

  const selection = await prisma.selection.create({
    data: {
      tripId: data.tripId,
      optionIds: JSON.stringify(data.optionIds),
      total: data.total,
      contactName: data.contactName ?? null,
      contactEmail: data.contactEmail ?? null,
    },
  });

  return NextResponse.json({ ok: true, id: selection.id }, { status: 201 });
}
