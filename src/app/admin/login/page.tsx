"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-deep px-6 text-paper">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-ember">Espace administrateur</p>
        <h1 className="mt-3 font-display text-3xl">Connexion</h1>

        <form action={formAction} className="mt-8 space-y-4">
          <div>
            <label className="eyebrow text-mist">E-mail</label>
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              className="mt-2 w-full rounded-xl border border-ink-line bg-ink px-4 py-3 text-sm outline-none focus:border-ember"
            />
          </div>
          <div>
            <label className="eyebrow text-mist">Mot de passe</label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-xl border border-ink-line bg-ink px-4 py-3 text-sm outline-none focus:border-ember"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-ember-soft">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-ember px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-ember-deep disabled:opacity-60"
          >
            {pending ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 font-mono text-[11px] text-mist">
          Démo — admin@voyage.test / voyage123
        </p>
      </div>
    </main>
  );
}
