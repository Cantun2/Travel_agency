"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Hero } from "./Hero";
import { DaySection, type StepData } from "./DaySection";
import { TotalBar } from "./TotalBar";
import { Recap } from "./Recap";
import { formatPrice } from "@/lib/format";

// Leaflet touche `window` : chargé uniquement côté client.
const RouteMap = dynamic(
  () => import("./RouteMap").then((m) => m.RouteMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-ink-deep" />,
  }
);

export type TripData = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  intro?: string | null;
  heroImage?: string | null;
  currency: string;
  steps: StepData[];
};

export function VoyageExperience({ trip }: { trip: TripData }) {
  const { steps, currency } = trip;

  // --- Sélection des options (persistée en local) ---
  const storageKey = `voyage:${trip.slug}`;
  const [selected, setSelected] = useState<Set<string>>(() => {
    const init = new Set<string>();
    for (const s of steps)
      for (const o of s.options) if (o.selectedByDefault) init.add(o.id);
    return init;
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const ids = JSON.parse(raw) as string[];
        const valid = new Set(steps.flatMap((s) => s.options.map((o) => o.id)));
        setSelected(new Set(ids.filter((id) => valid.has(id))));
      }
    } catch {
      /* défaut conservé */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        try {
          localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [storageKey]
  );

  // --- Total : forfait (prix de base) + options cochées ---
  const total = useMemo(() => {
    let t = 0;
    for (const s of steps) {
      t += s.basePrice;
      for (const o of s.options) if (selected.has(o.id)) t += o.price;
    }
    return t;
  }, [steps, selected]);

  // --- Carte : points, étape active, progression du tracé ---
  const points = useMemo(
    () =>
      steps
        .filter((s) => s.lat != null && s.lng != null)
        .map((s) => ({
          lat: s.lat as number,
          lng: s.lng as number,
          place: s.place,
          day: s.day,
        })),
    [steps]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const stepsRef = useRef<HTMLDivElement>(null);
  const [recapOpen, setRecapOpen] = useState(false);

  // Étape active : section la plus proche du centre du viewport.
  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;
    const sections = Array.from(
      el.querySelectorAll<HTMLElement>("[data-day-index]")
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = Number(e.target.getAttribute("data-day-index"));
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root: null, rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [steps.length]);

  // Progression continue du tracé, calée sur le défilement de l'itinéraire.
  useEffect(() => {
    let raf = 0;
    function update() {
      const el = stepsRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = rect.height - vh;
      const scrolled = -rect.top;
      const p = scrollable > 0 ? scrolled / scrollable : 0;
      setProgress(Math.max(0, Math.min(1, p)));
    }
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [steps.length]);

  const activeStep = steps[activeIndex];
  const optionCount = selected.size;

  return (
    <main className="bg-paper">
      <Hero
        title={trip.title}
        subtitle={trip.subtitle}
        intro={trip.intro}
        heroImage={trip.heroImage}
        stepCount={steps.length}
      />

      <section className="relative bg-ink-deep">
        <div className="lg:grid lg:grid-cols-[1fr_1.05fr]">
          {/* CARTE — collante : bandeau en haut sur mobile, colonne pleine hauteur sur desktop */}
          <div className="sticky top-0 z-20 h-[42vh] lg:z-0 lg:h-screen">
            <div className="relative h-full w-full">
              {points.length > 0 ? (
                <RouteMap
                  points={points}
                  progress={progress}
                  activeIndex={activeIndex}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-ink-deep text-mist">
                  <span className="eyebrow">Carte indisponible</span>
                </div>
              )}

              {/* HUD : repère de l'étape active */}
              {activeStep && (
                <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-ink-deep/70 px-3 py-2 backdrop-blur">
                  <p className="eyebrow text-ember">
                    {activeStep.day ?? `Étape ${activeIndex + 1}`}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-paper/70">
                    {activeStep.place}
                    {activeStep.lat != null && activeStep.lng != null && (
                      <span className="text-paper/40">
                        {" "}
                        · {activeStep.lat.toFixed(3)}, {activeStep.lng.toFixed(3)}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ÉTAPES — papier, défilent face à la carte */}
          <div
            ref={stepsRef}
            className="relative z-10 bg-paper px-6 pb-28 sm:px-10 lg:px-14"
          >
            {steps.map((step, i) => (
              <DaySection
                key={step.id}
                step={step}
                index={i}
                total={steps.length}
                currency={currency}
                selected={selected}
                onToggle={toggle}
              />
            ))}

            {/* Clôture de l'itinéraire */}
            <div className="py-16 text-center">
              <p className="eyebrow text-ember">Fin de l&apos;itinéraire</p>
              <p className="mt-3 font-display text-2xl text-ink">
                Votre voyage, composé.
              </p>
              <p className="mt-2 font-mono text-sm text-ink/50">
                Estimation actuelle — {formatPrice(total, currency)}
              </p>
              <button
                onClick={() => setRecapOpen(true)}
                className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
              >
                Voir le récapitulatif
              </button>
            </div>
          </div>
        </div>
      </section>

      <TotalBar
        total={total}
        currency={currency}
        optionCount={optionCount}
        onSeeRecap={() => setRecapOpen(true)}
      />

      <Recap
        open={recapOpen}
        onClose={() => setRecapOpen(false)}
        tripId={trip.id}
        tripTitle={trip.title}
        steps={steps}
        selected={selected}
        currency={currency}
      />
    </main>
  );
}
