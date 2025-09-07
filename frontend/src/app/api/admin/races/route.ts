import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const year = req.nextUrl.searchParams.get("year");
  const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE}/admin/races`);
  if (year) url.searchParams.set("year", year);

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const text = await res.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { error: text || "Unknown error" }; }
  return NextResponse.json(data, { status: res.status });
}
