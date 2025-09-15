import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bio/riders`, { cache: "no-store" });
  const text = await res.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { error: text || "Internal Server Error" }; }
  return NextResponse.json(data, { status: res.status });
}