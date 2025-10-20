import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ person_id: string }> }
) {
  try {
    const { person_id } = await ctx.params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/bio/riders/person/${person_id}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Rider not found" }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
