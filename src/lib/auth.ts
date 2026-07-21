import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "admin_session";

function expectedToken(): string {
  return createHmac("sha256", process.env.SESSION_SECRET!)
    .update("admin")
    .digest("hex");
}

export function checkPassword(password: string): boolean {
  const expected = Buffer.from(process.env.ADMIN_PASSWORD ?? "");
  const given = Buffer.from(password);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function createAdminSession(): Promise<void> {
  (await cookies()).set(COOKIE, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function destroyAdminSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  return token === expectedToken();
}

// تُستدعى أول كل صفحة وإجراء بلوحة الإدارة
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
