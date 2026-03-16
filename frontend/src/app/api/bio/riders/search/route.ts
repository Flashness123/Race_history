import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const limit = searchParams.get("limit") ?? "3";

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/bio/riders/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`,
      {
        cache: "no-store",
      }
    );
    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || "Internal Server Error" };
    }
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

