import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}
