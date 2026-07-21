import { NextRequest, NextResponse } from "next/server";

// يضمن وجود معرّف جلسة مجهول (sid) لسجلات البحث والنقرات — بدون أي هوية شخصية
export function proxy(req: NextRequest) {
  const res = NextResponse.next();
  if (!req.cookies.get("sid")) {
    res.cookies.set("sid", crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 180,
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
