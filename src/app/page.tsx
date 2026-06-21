import Link from "next/link";
import { listPublishedTrips } from "@/lib/trips";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const trips = await listPublishedTrips();

  return (
    <main className="min-h-screen bg-ink-deep text-paper">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:px-10 lg:py-28">
        <p className="eyebrow text-ember">Atelier d&apos;itinéraires</p>
        <h1 className="mt-4 max-w-2xl font-display text-5xl font-light leading-[1.05] tracking-tight lg:text-6xl">
          Des voyages qui se dessinent au fil de la page.
        </h1>
        <p className="mt-5 max-w-xl text-paper/65">
          Chaque proposition déroule un itinéraire sur la carte, journée après
          journée. Vous composez vos expériences, le devis se construit en
          direct.
        </p>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-ink-line bg-ink-line sm:grid-cols-2">
          {trips.length === 0 && (
            <div className="bg-ink-deep p-10 text-mist sm:col-span-2">
              Aucun voyage publié pour l&apos;instant. Rendez-vous dans{" "}
              <Link href="/admin" className="text-ember underline">
                l&apos;espace admin
              </Link>{" "}
              pour en créer un.
            </div>
          )}
          {trips.map((t) => (
            <Link
              key={t.slug}
              href={`/voyage/${t.slug}`}
              className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden bg-ink p-7 transition-colors"
            >
              {t.heroImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.heroImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-45 transition-all duration-700 group-hover:scale-105 group-hover:opacity-60"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/40 to-transparent" />
              <div className="relative">
                <span className="eyebrow text-ember">
                  {t._count.steps} étapes
                </span>
                <h2 className="mt-2 font-display text-2xl leading-tight">
                  {t.title}
                </h2>
                {t.subtitle && (
                  <p className="mt-1 text-sm text-paper/70">{t.subtitle}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-16 font-mono text-xs text-mist">
          <Link href="/admin" className="hover:text-paper">
            → Espace administrateur
          </Link>
        </p>
      </div>
    </main>
  );
}
