"use client";

import { motion } from "framer-motion";

export function Hero({
  title,
  subtitle,
  intro,
  heroImage,
  stepCount,
}: {
  title: string;
  subtitle?: string | null;
  intro?: string | null;
  heroImage?: string | null;
  stepCount: number;
}) {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink-deep text-paper">
      {/* Image de fond */}
      {heroImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/55 to-ink-deep/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-deep/70 to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-32 sm:px-10 lg:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow text-ember">
            Proposition d&apos;itinéraire · {stepCount} étapes
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-[2.7rem] font-light leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 max-w-xl font-display text-xl font-light text-paper/85 sm:text-2xl">
              {subtitle}
            </p>
          )}
          {intro && (
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-paper/70">
              {intro}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-12 flex items-center gap-3 text-paper/55"
        >
          <span className="eyebrow">Faites défiler</span>
          <motion.span
            aria-hidden
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="text-ember"
          >
            ↓
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
