import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const body = await req.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    
    let data;
    try {
      data = await res.json();
    } catch (jsonError) {
      // If backend returns non-JSON response, return a generic error
      return NextResponse.json({ error: `Backend error: ${res.status} ${res.statusText}` }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
