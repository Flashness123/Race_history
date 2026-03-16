import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { detail: text || "Registration failed" };
    }

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { detail: "Registration service unavailable. Please try again." },
      { status: 502 }
    );
  }
}
