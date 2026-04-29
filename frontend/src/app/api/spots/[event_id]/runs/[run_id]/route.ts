import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ event_id: string; run_id: string }> }
) {
  const { event_id, run_id } = await ctx.params;
  const token = request.cookies.get("auth")?.value;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/spots/${event_id}/runs/${run_id}`, {
    headers,
    cache: "no-store",
  });
  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { error: text || "Internal Server Error" }; }
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ event_id: string; run_id: string }> }
) {
  const { event_id, run_id } = await ctx.params;
  const token = request.cookies.get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const res = await fetch(`${API_BASE}/spots/${event_id}/runs/${run_id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 204) return new NextResponse(null, { status: 204 });
  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { error: text || "Internal Server Error" }; }
  return NextResponse.json(data, { status: res.status });
}
