import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const token = req.cookies.get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/races/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { error: text || "Unknown error" }; }
  return NextResponse.json(data, { status: res.status });
}
