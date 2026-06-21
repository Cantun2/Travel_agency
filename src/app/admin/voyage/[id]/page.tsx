import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  updateTrip,
  togglePublish,
  addStep,
  updateStep,
  deleteStep,
  moveStep,
  addOption,
  updateOption,
  deleteOption,
} from "../../actions";

export const dynamic = "force-dynamic";

const field =
  "mt-1.5 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ember";
const lbl = "eyebrow text-ink/40";
const save =
  "rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper transition-colors hover:bg-ink-soft";

export default async function TripEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      steps: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!trip) notFound();

  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* En-tête */}
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4 sm:px-10">
          <Link href="/admin" className="font-mono text-xs text-ink/50 hover:text-ink">
            ← Tous les voyages
          </Link>
          <div className="flex items-center gap-2">
            {trip.published && (
              <Link
                href={`/voyage/${trip.slug}`}
                target="_blank"
                className="rounded-full border border-ink/15 px-4 py-2 text-sm hover:border-ink/40"
              >
                Voir en ligne
              </Link>
            )}
            <form action={togglePublish}>
              <input type="hidden" name="id" value={trip.id} />
              <button className="rounded-full bg-ember px-4 py-2 text-sm font-medium text-white hover:bg-ember-deep">
                {trip.published ? "Dépublier" : "Publier"}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
        {/* Métadonnées du voyage */}
        <section>
          <p className="eyebrow text-ember">Présentation</p>
          <form action={updateTrip} className="mt-4 space-y-4">
            <input type="hidden" name="id" value={trip.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={lbl}>Titre</label>
                <input name="title" defaultValue={trip.title} className={field} />
              </div>
              <div>
                <label className={lbl}>Slug (URL)</label>
                <input name="slug" defaultValue={trip.slug} className={field} />
              </div>
            </div>
            <div>
              <label className={lbl}>Sous-titre</label>
              <input
                name="subtitle"
                defaultValue={trip.subtitle ?? ""}
                className={field}
              />
            </div>
            <div>
              <label className={lbl}>Introduction (héro)</label>
              <textarea
                name="intro"
                defaultValue={trip.intro ?? ""}
                rows={3}
                className={field}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
              <div>
                <label className={lbl}>Image d&apos;accueil (URL)</label>
                <input
                  name="heroImage"
                  defaultValue={trip.heroImage ?? ""}
                  className={field}
                />
              </div>
              <div>
                <label className={lbl}>Devise</label>
                <input
                  name="currency"
                  defaultValue={trip.currency}
                  className={field}
                />
              </div>
            </div>
            <button className={save}>Enregistrer la présentation</button>
          </form>
        </section>

        <div className="my-10 hairline" />

        {/* Étapes */}
        <section>
          <div className="flex items-center justify-between">
            <p className="eyebrow text-ember">
              Itinéraire — {trip.steps.length} étape
              {trip.steps.length > 1 ? "s" : ""}
            </p>
            <form action={addStep}>
              <input type="hidden" name="tripId" value={trip.id} />
              <button className="rounded-full border border-ink/20 px-4 py-2 text-sm hover:border-ember hover:text-ember">
                + Ajouter une étape
              </button>
            </form>
          </div>

          <div className="mt-6 space-y-5">
            {trip.steps.map((step, i) => (
              <article
                key={step.id}
                className="rounded-2xl border border-ink/12 bg-white/50 p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs text-ink/40">
                    {String(i + 1).padStart(2, "0")} / {String(trip.steps.length).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-1">
                    <form action={moveStep}>
                      <input type="hidden" name="id" value={step.id} />
                      <input type="hidden" name="tripId" value={trip.id} />
                      <input type="hidden" name="dir" value="up" />
                      <button
                        disabled={i === 0}
                        className="rounded-md px-2 py-1 text-ink/50 hover:bg-ink/5 disabled:opacity-30"
                        aria-label="Monter"
                      >
                        ↑
                      </button>
                    </form>
                    <form action={moveStep}>
                      <input type="hidden" name="id" value={step.id} />
                      <input type="hidden" name="tripId" value={trip.id} />
                      <input type="hidden" name="dir" value="down" />
                      <button
                        disabled={i === trip.steps.length - 1}
                        className="rounded-md px-2 py-1 text-ink/50 hover:bg-ink/5 disabled:opacity-30"
                        aria-label="Descendre"
                      >
                        ↓
                      </button>
                    </form>
                    <form action={deleteStep}>
                      <input type="hidden" name="id" value={step.id} />
                      <input type="hidden" name="tripId" value={trip.id} />
                      <button className="rounded-md px-2 py-1 text-ink/40 hover:text-ember-deep">
                        Suppr.
                      </button>
                    </form>
                  </div>
                </div>

                <form action={updateStep} className="space-y-4">
                  <input type="hidden" name="id" value={step.id} />
                  <input type="hidden" name="tripId" value={trip.id} />
                  <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                    <div>
                      <label className={lbl}>Jour</label>
                      <input name="day" defaultValue={step.day ?? ""} className={field} />
                    </div>
                    <div>
                      <label className={lbl}>Lieu</label>
                      <input name="place" defaultValue={step.place} className={field} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Titre de l&apos;étape</label>
                    <input name="title" defaultValue={step.title} className={field} />
                  </div>
                  <div>
                    <label className={lbl}>Récit</label>
                    <textarea
                      name="description"
                      defaultValue={step.description ?? ""}
                      rows={3}
                      className={field}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className={lbl}>Latitude</label>
                      <input name="lat" defaultValue={step.lat ?? ""} className={field} />
                    </div>
                    <div>
                      <label className={lbl}>Longitude</label>
                      <input name="lng" defaultValue={step.lng ?? ""} className={field} />
                    </div>
                    <div>
                      <label className={lbl}>Prix forfait (€)</label>
                      <input
                        name="basePrice"
                        defaultValue={(step.basePrice / 100).toString()}
                        className={field}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>
                      Médias — JSON : [&#123;&quot;type&quot;:&quot;image&quot;|&quot;video&quot;,&quot;url&quot;:&quot;…&quot;,&quot;caption&quot;:&quot;…&quot;&#125;]
                    </label>
                    <textarea
                      name="media"
                      defaultValue={step.media}
                      rows={3}
                      className={`${field} font-mono text-xs`}
                    />
                  </div>
                  <button className={save}>Enregistrer l&apos;étape</button>
                </form>

                {/* Options de l'étape */}
                <div className="mt-5 border-t border-ink/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-ink/40">
                      Expériences cochables
                    </span>
                    <form action={addOption}>
                      <input type="hidden" name="stepId" value={step.id} />
                      <input type="hidden" name="tripId" value={trip.id} />
                      <button className="text-xs text-ember hover:underline">
                        + Ajouter une option
                      </button>
                    </form>
                  </div>

                  <div className="mt-3 space-y-3">
                    {step.options.length === 0 && (
                      <p className="text-xs text-ink/40">Aucune option.</p>
                    )}
                    {step.options.map((o) => (
                      <form
                        key={o.id}
                        action={updateOption}
                        className="rounded-xl border border-ink/10 bg-white/60 p-3"
                      >
                        <input type="hidden" name="id" value={o.id} />
                        <input type="hidden" name="tripId" value={trip.id} />
                        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                          <input
                            name="label"
                            defaultValue={o.label}
                            placeholder="Intitulé"
                            className={field}
                          />
                          <input
                            name="price"
                            defaultValue={(o.price / 100).toString()}
                            placeholder="Prix (€)"
                            className={field}
                          />
                        </div>
                        <input
                          name="description"
                          defaultValue={o.description ?? ""}
                          placeholder="Description"
                          className={`${field} mt-3`}
                        />
                        <div className="mt-3 flex items-center justify-between">
                          <label className="flex items-center gap-2 text-xs text-ink/60">
                            <input
                              type="checkbox"
                              name="selectedByDefault"
                              defaultChecked={o.selectedByDefault}
                              className="accent-ember"
                            />
                            Cochée par défaut
                          </label>
                          <div className="flex gap-2">
                            <button className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-ink-soft">
                              Enregistrer
                            </button>
                            <button
                              formAction={deleteOption}
                              className="rounded-full px-3 py-1.5 text-xs text-ink/40 hover:text-ember-deep"
                            >
                              Suppr.
                            </button>
                          </div>
                        </div>
                      </form>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
