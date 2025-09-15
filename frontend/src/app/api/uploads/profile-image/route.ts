import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const form = await req.formData();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/uploads/profile-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const text = await res.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { error: text || "Internal Server Error" }; }
  return NextResponse.json(data, { status: res.status });
}