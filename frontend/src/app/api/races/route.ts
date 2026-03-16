import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const year = req.nextUrl.searchParams.get("year");

  if (!year) {
    return NextResponse.json({ error: "Missing year" }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/races?year=${encodeURIComponent(year)}`, {
      cache: "no-store",
    });

    const text = await res.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || "Failed to fetch races" };
    }

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Race data service unavailable. Please try again." },
      { status: 502 }
    );
  }
}
