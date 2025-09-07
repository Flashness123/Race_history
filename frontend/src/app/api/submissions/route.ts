import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/submissions`, {
    headers: {
      cookie: req.headers.get("cookie") || "", // forward cookies
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/submissions/${body.id}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: req.headers.get("cookie") || "",
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
