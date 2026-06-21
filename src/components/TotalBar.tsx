"use client";

import { formatPrice } from "@/lib/format";

export function TotalBar({
  total,
  currency,
  optionCount,
  onSeeRecap,
}: {
  total: number;
  currency: string;
  optionCount: number;
  onSeeRecap: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[1000] p-4">
      <div className="pointer-events-auto mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-2xl border border-white/10 bg-ink-deep/90 px-5 py-3 text-white shadow-2xl backdrop-blur">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-mist">
            Estimation
          </span>
          <span className="font-display text-2xl leading-none">
            {formatPrice(total, currency)}
          </span>
          <span className="hidden font-mono text-[11px] text-mist sm:inline">
            {optionCount} option{optionCount > 1 ? "s" : ""}
          </span>
        </div>
        <button
          type="button"
          onClick={onSeeRecap}
          className="rounded-full bg-ember px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-ember-deep"
        >
          Récapitulatif
        </button>
      </div>
    </div>
  );
}
