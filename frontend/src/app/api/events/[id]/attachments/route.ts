import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const token = request.cookies.get("auth")?.value;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/events/${id}/attachments`, {
    headers,
    cache: "no-store",
  });
  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { error: text || "Internal Server Error" }; }
  return NextResponse.json(data, { status: res.status });
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const token = request.cookies.get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const formData = await request.formData();

  const res = await fetch(`${API_BASE}/events/${id}/attachments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { error: text || "Internal Server Error" }; }
  return NextResponse.json(data, { status: res.status });
}
