import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params; // ✅ await params

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bio/riders/${id}`, {
    cache: "no-store",
  });

  // Safely parse JSON even if backend returns HTML error text
  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { error: text || "Internal Server Error" }; }

  return NextResponse.json(data, { status: res.status });
}
