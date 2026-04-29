import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ event_id: string; run_id: string }> }
) {
  const { event_id, run_id } = await ctx.params;

  const res = await fetch(`${API_BASE}/spots/${event_id}/runs/${run_id}/download`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "File not found" }, { status: res.status });
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get("content-disposition") ?? `attachment; filename="run_${run_id}.csv"`;

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": contentDisposition,
    },
  });
}
