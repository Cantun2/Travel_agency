"use client";

import { formatPrice } from "@/lib/format";

export function OptionToggle({
  id,
  label,
  description,
  price,
  currency,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  description?: string | null;
  price: number;
  currency: string;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onToggle(id)}
      className={`group flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors ${
        checked
          ? "border-ember/60 bg-ember/[0.06]"
          : "border-ink/12 bg-white/40 hover:border-ink/25"
      }`}
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          checked ? "border-ember bg-ember text-white" : "border-ink/30 bg-transparent"
        }`}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.5L5 9L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

      <span className="flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="font-medium leading-snug text-ink">{label}</span>
          <span className="shrink-0 font-mono text-sm text-ember">
            +{formatPrice(price, currency)}
          </span>
        </span>
        {description && (
          <span className="mt-1 block text-sm leading-relaxed text-ink/60">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}
