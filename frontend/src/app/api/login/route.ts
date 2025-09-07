import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const data = await res.json(); // {access_token, role, name}
  const resp = NextResponse.json({ ok: true, role: data.role, name: data.name });
  resp.cookies.set("auth", data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // secure: true, // enable in production (https)
    maxAge: 60 * 60,
  });
  return resp;
}
