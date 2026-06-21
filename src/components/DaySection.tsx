"use client";

import { motion } from "framer-motion";
import { MediaFrame } from "./MediaFrame";
import { OptionToggle } from "./OptionToggle";
import { formatPrice } from "@/lib/format";
import type { MediaItem } from "@/lib/types";

export type StepData = {
  id: string;
  day?: string | null;
  place: string;
  lat?: number | null;
  lng?: number | null;
  title: string;
  description?: string | null;
  basePrice: number;
  media: MediaItem[];
  options: {
    id: string;
    label: string;
    description?: string | null;
    price: number;
    selectedByDefault: boolean;
  }[];
};

export function DaySection({
  step,
  index,
  total,
  currency,
  selected,
  onToggle,
}: {
  step: StepData;
  index: number;
  total: number;
  currency: string;
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const coord =
    step.lat != null && step.lng != null
      ? `${step.lat.toFixed(4)}, ${step.lng.toFixed(4)}`
      : null;

  return (
    <section
      data-day-index={index}
      className="min-h-[80vh] border-b border-ink/10 py-16 first:pt-10 lg:py-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* En-tête de journée */}
        <div className="flex items-baseline justify-between gap-4">
          <span className="eyebrow text-ember">
            {step.day ?? `Étape ${index + 1}`}
          </span>
          <span className="font-mono text-[11px] text-ink/35">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-ink/45">
          {step.place}
          {coord && <span className="text-ink/25"> · {coord}</span>}
        </p>

        <h2 className="mt-2 font-display text-3xl leading-[1.1] tracking-tight text-ink lg:text-[2.6rem]">
          {step.title}
        </h2>

        {step.description && (
          <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-ink/70">
            {step.description}
          </p>
        )}

        {/* Médias */}
        {step.media.length > 0 && (
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {step.media.map((m, i) => (
              <div key={i} className={step.media.length === 1 ? "sm:col-span-2" : ""}>
                <MediaFrame item={m} label={step.place} priority={index === 0} />
              </div>
            ))}
          </div>
        )}

        {/* Options */}
        {step.options.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-3">
              <span className="eyebrow text-ink/45">Expériences à composer</span>
              <span className="hairline flex-1" />
            </div>
            <div className="mt-4 grid gap-3">
              {step.options.map((o) => (
                <OptionToggle
                  key={o.id}
                  id={o.id}
                  label={o.label}
                  description={o.description}
                  price={o.price}
                  currency={currency}
                  checked={selected.has(o.id)}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>
        )}

        {step.basePrice > 0 && (
          <p className="mt-6 font-mono text-xs text-ink/40">
            Étape incluse au forfait — {formatPrice(step.basePrice, currency)}
          </p>
        )}
      </motion.div>
    </section>
  );
}
