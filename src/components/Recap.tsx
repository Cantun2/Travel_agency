"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/format";
import type { StepData } from "./DaySection";

type Line = { stepDay: string; label: string; price: number };

export function Recap({
  open,
  onClose,
  tripId,
  tripTitle,
  steps,
  selected,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  tripTitle: string;
  steps: StepData[];
  selected: Set<string>;
  currency: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const included: Line[] = steps
    .filter((s) => s.basePrice > 0)
    .map((s) => ({
      stepDay: s.day ?? s.place,
      label: s.title,
      price: s.basePrice,
    }));

  const optionLines: Line[] = [];
  for (const s of steps) {
    for (const o of s.options) {
      if (selected.has(o.id)) {
        optionLines.push({
          stepDay: s.day ?? s.place,
          label: o.label,
          price: o.price,
        });
      }
    }
  }

  const total =
    included.reduce((a, l) => a + l.price, 0) +
    optionLines.reduce((a, l) => a + l.price, 0);

  async function submit() {
    setStatus("sending");
    try {
      const res = await fetch("/api/selections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          optionIds: Array.from(selected),
          total,
          contactName: name || null,
          contactEmail: email || null,
        }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1100] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink-deep/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Récapitulatif du voyage"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper p-7 text-ink shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow text-ember">Carnet de route</p>
                <h2 className="mt-1 font-display text-2xl leading-tight">
                  {tripTitle}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="rounded-full p-2 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                ✕
              </button>
            </div>

            {included.length > 0 && (
              <div className="mt-6">
                <p className="eyebrow text-ink/40">Au forfait</p>
                <ul className="mt-2 divide-y divide-ink/10">
                  {included.map((l, i) => (
                    <li key={i} className="flex justify-between gap-4 py-2">
                      <span className="text-sm">
                        <span className="font-mono text-[11px] text-ink/40">
                          {l.stepDay}
                        </span>{" "}
                        — {l.label}
                      </span>
                      <span className="shrink-0 font-mono text-sm text-ink/60">
                        {formatPrice(l.price, currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5">
              <p className="eyebrow text-ink/40">Expériences choisies</p>
              {optionLines.length === 0 ? (
                <p className="mt-2 text-sm text-ink/50">
                  Aucune option ajoutée pour l&apos;instant. Cochez des
                  expériences au fil de l&apos;itinéraire.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-ink/10">
                  {optionLines.map((l, i) => (
                    <li key={i} className="flex justify-between gap-4 py-2">
                      <span className="text-sm">
                        <span className="font-mono text-[11px] text-ember">
                          {l.stepDay}
                        </span>{" "}
                        — {l.label}
                      </span>
                      <span className="shrink-0 font-mono text-sm text-ember">
                        +{formatPrice(l.price, currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 flex items-baseline justify-between border-t border-ink/15 pt-4">
              <span className="eyebrow text-ink/45">Estimation totale</span>
              <span className="font-display text-3xl">
                {formatPrice(total, currency)}
              </span>
            </div>

            {/* Demande de devis */}
            {status === "sent" ? (
              <p className="mt-6 rounded-xl bg-ember/10 px-4 py-3 text-sm text-ink">
                Demande envoyée. Nous revenons vers vous avec la proposition
                détaillée.
              </p>
            ) : (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-ink/60">
                  Envoyez cette sélection pour recevoir le devis détaillé.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom"
                    className="rounded-xl border border-ink/15 bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-ember"
                  />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre e-mail"
                    type="email"
                    className="rounded-xl border border-ink/15 bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-ember"
                  />
                </div>
                <button
                  onClick={submit}
                  disabled={status === "sending"}
                  className="w-full rounded-full bg-ember px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-ember-deep disabled:opacity-60"
                >
                  {status === "sending"
                    ? "Envoi…"
                    : "Envoyer ma sélection"}
                </button>
                {status === "error" && (
                  <p className="text-sm text-ember-deep">
                    L&apos;envoi a échoué. Réessayez dans un instant.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
