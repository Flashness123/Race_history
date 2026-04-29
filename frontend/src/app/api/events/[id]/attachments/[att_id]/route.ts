import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; att_id: string }> }
) {
  const { id, att_id } = await ctx.params;
  const token = request.cookies.get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const res = await fetch(`${API_BASE}/events/${id}/attachments/${att_id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 204) return new NextResponse(null, { status: 204 });
  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { error: text || "Internal Server Error" }; }
  return NextResponse.json(data, { status: res.status });
}
