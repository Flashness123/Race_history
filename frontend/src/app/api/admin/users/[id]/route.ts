import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const token = req.cookies.get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/admin/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: any;
  try { data = JSON.parse(text); } catch { data = { error: text || "Unknown error" }; }
  return NextResponse.json(data, { status: res.status });
}
