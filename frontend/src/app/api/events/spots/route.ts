import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/events/spots`, { cache: "no-store" });
  const text = await res.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { error: text || "Internal Server Error" }; }
  return NextResponse.json(data, { status: res.status });
}
