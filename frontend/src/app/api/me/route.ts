import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 200 });
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ authenticated: false }, { status: 200 });
  const user = await res.json();
  return NextResponse.json({ authenticated: true, user }, { status: 200 });
}
