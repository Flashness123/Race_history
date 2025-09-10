import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bio/riders`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}