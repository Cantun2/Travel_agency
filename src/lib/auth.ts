import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const COOKIE = "voyage_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "fallback-dev-secret-change-me-please-1234"
);

export type Session = { adminId: string; email: string };

async function sign(payload: Session): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { adminId: payload.adminId as string, email: payload.email as string };
  } catch {
    return null;
  }
}

// Vérifie les identifiants et pose le cookie de session. Retourne une erreur lisible ou null.
export async function login(email: string, password: string): Promise<string | null> {
  const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!admin) return "Identifiants incorrects.";

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return "Identifiants incorrects.";

  const token = await sign({ adminId: admin.id, email: admin.email });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return null;
}

export async function logout(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

// À appeler en haut des pages/actions admin.
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
