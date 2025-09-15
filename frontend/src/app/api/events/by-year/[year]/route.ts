import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ year: string }> }) {
  const { year } = await ctx.params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/events/by-year/${year}`, { cache: "no-store" });
  const text = await res.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { error: text || "Internal Server Error" }; }
  return NextResponse.json(data, { status: res.status });
}