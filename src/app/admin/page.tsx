import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import {
  createTrip,
  togglePublish,
  deleteTrip,
  logoutAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await requireAdmin();

  const trips = await prisma.trip.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { steps: true, selections: true } },
    },
  });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 sm:px-10">
          <div>
            <p className="eyebrow text-ember">Atelier</p>
            <h1 className="font-display text-2xl">Vos voyages</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-xs text-ink/45 sm:inline">
              {session.email}
            </span>
            <form action={logoutAction}>
              <button className="rounded-full border border-ink/15 px-4 py-2 text-sm transition-colors hover:border-ink/40">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        {/* Création */}
        <form
          action={createTrip}
          className="flex flex-col gap-3 rounded-2xl border border-ink/12 bg-white/50 p-5 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="eyebrow text-ink/45">Titre du nouveau voyage</label>
            <input
              name="title"
              placeholder="Ex. Islande, la côte sauvage du Sud"
              className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-ember"
            />
          </div>
          <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-soft">
            Créer le voyage
          </button>
        </form>

        {/* Liste */}
        <div className="mt-8 space-y-3">
          {trips.length === 0 && (
            <p className="py-10 text-center text-ink/50">
              Aucun voyage. Créez le premier ci-dessus.
            </p>
          )}
          {trips.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-4 rounded-2xl border border-ink/12 bg-white/40 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      t.published ? "bg-ember" : "bg-ink/25"
                    }`}
                  />
                  <h2 className="truncate font-display text-xl">{t.title}</h2>
                </div>
                <p className="mt-1 font-mono text-[11px] text-ink/45">
                  /voyage/{t.slug} · {t._count.steps} étapes ·{" "}
                  {t._count.selections} demande
                  {t._count.selections > 1 ? "s" : ""} ·{" "}
                  {t.published ? "Publié" : "Brouillon"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/voyage/${t.id}`}
                  className="rounded-full bg-ember px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ember-deep"
                >
                  Éditer
                </Link>
                {t.published && (
                  <Link
                    href={`/voyage/${t.slug}`}
                    target="_blank"
                    className="rounded-full border border-ink/15 px-4 py-2 text-sm transition-colors hover:border-ink/40"
                  >
                    Voir
                  </Link>
                )}
                <form action={togglePublish}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="rounded-full border border-ink/15 px-4 py-2 text-sm transition-colors hover:border-ink/40">
                    {t.published ? "Dépublier" : "Publier"}
                  </button>
                </form>
                <form action={deleteTrip}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="rounded-full px-3 py-2 text-sm text-ink/40 transition-colors hover:text-ember-deep">
                    Supprimer
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
