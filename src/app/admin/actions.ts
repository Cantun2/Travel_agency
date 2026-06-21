"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { login, logout, requireAdmin } from "@/lib/auth";

// ---------- Auth ----------

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Renseignez vos identifiants." };

  const err = await login(email, password);
  if (err) return { error: err };
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

// ---------- Helpers ----------

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

function euros(v: FormDataEntryValue | null): number {
  const n = parseFloat(String(v ?? "0").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function num(v: FormDataEntryValue | null): number | null {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function str(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

// ---------- Voyages ----------

export async function createTrip(formData: FormData) {
  await requireAdmin();
  const title = str(formData.get("title")) || "Nouveau voyage";
  let slug = slugify(str(formData.get("slug")) || title) || "voyage";

  // Évite la collision de slug.
  let n = 1;
  while (await prisma.trip.findUnique({ where: { slug } })) {
    slug = `${slugify(title)}-${++n}`;
  }

  const trip = await prisma.trip.create({ data: { title, slug } });
  revalidatePath("/admin");
  redirect(`/admin/voyage/${trip.id}`);
}

export async function updateTrip(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  await prisma.trip.update({
    where: { id },
    data: {
      title: str(formData.get("title")),
      subtitle: str(formData.get("subtitle")) || null,
      slug: slugify(str(formData.get("slug"))),
      intro: str(formData.get("intro")) || null,
      heroImage: str(formData.get("heroImage")) || null,
      currency: str(formData.get("currency")) || "EUR",
    },
  });
  revalidatePath(`/admin/voyage/${id}`);
  revalidatePath("/admin");
}

export async function togglePublish(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) return;
  await prisma.trip.update({
    where: { id },
    data: { published: !trip.published },
  });
  revalidatePath("/admin");
  revalidatePath(`/admin/voyage/${id}`);
  revalidatePath(`/voyage/${trip.slug}`);
}

export async function deleteTrip(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  await prisma.trip.delete({ where: { id } });
  revalidatePath("/admin");
  redirect("/admin");
}

// ---------- Étapes ----------

export async function addStep(formData: FormData) {
  await requireAdmin();
  const tripId = str(formData.get("tripId"));
  const count = await prisma.step.count({ where: { tripId } });
  await prisma.step.create({
    data: {
      tripId,
      order: count,
      day: `Jour ${String(count + 1).padStart(2, "0")}`,
      place: "Nouveau lieu",
      title: "Nouvelle étape",
    },
  });
  revalidatePath(`/admin/voyage/${tripId}`);
}

export async function updateStep(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  const tripId = str(formData.get("tripId"));
  await prisma.step.update({
    where: { id },
    data: {
      day: str(formData.get("day")) || null,
      place: str(formData.get("place")),
      lat: num(formData.get("lat")),
      lng: num(formData.get("lng")),
      title: str(formData.get("title")),
      description: str(formData.get("description")) || null,
      basePrice: euros(formData.get("basePrice")),
      media: str(formData.get("media")) || "[]",
    },
  });
  revalidatePath(`/admin/voyage/${tripId}`);
}

export async function deleteStep(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  const tripId = str(formData.get("tripId"));
  await prisma.step.delete({ where: { id } });
  revalidatePath(`/admin/voyage/${tripId}`);
}

export async function moveStep(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  const tripId = str(formData.get("tripId"));
  const dir = str(formData.get("dir")); // "up" | "down"

  const steps = await prisma.step.findMany({
    where: { tripId },
    orderBy: { order: "asc" },
  });
  const i = steps.findIndex((s) => s.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= steps.length) return;

  await prisma.$transaction([
    prisma.step.update({ where: { id: steps[i].id }, data: { order: steps[j].order } }),
    prisma.step.update({ where: { id: steps[j].id }, data: { order: steps[i].order } }),
  ]);
  revalidatePath(`/admin/voyage/${tripId}`);
}

// ---------- Options ----------

export async function addOption(formData: FormData) {
  await requireAdmin();
  const stepId = str(formData.get("stepId"));
  const tripId = str(formData.get("tripId"));
  const count = await prisma.option.count({ where: { stepId } });
  await prisma.option.create({
    data: { stepId, order: count, label: "Nouvelle expérience", price: 0 },
  });
  revalidatePath(`/admin/voyage/${tripId}`);
}

export async function updateOption(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  const tripId = str(formData.get("tripId"));
  await prisma.option.update({
    where: { id },
    data: {
      label: str(formData.get("label")),
      description: str(formData.get("description")) || null,
      price: euros(formData.get("price")),
      selectedByDefault: formData.get("selectedByDefault") === "on",
    },
  });
  revalidatePath(`/admin/voyage/${tripId}`);
}

export async function deleteOption(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("id"));
  const tripId = str(formData.get("tripId"));
  await prisma.option.delete({ where: { id } });
  revalidatePath(`/admin/voyage/${tripId}`);
}
