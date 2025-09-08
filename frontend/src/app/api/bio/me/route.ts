import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bio/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const text = await res.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { error: text || "Unknown error" }; }
  return NextResponse.json(data, { status: res.status });
}
