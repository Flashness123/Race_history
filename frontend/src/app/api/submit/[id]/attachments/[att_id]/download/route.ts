import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string; att_id: string }> }
) {
  const { id, att_id } = await ctx.params;

  const res = await fetch(
    `${API_BASE}/submissions/${id}/attachments/${att_id}/download`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "File not found" }, { status: res.status });
  }

  const blob = await res.blob();
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const contentDisposition = res.headers.get("content-disposition") ?? `attachment; filename="attachment_${att_id}"`;

  return new NextResponse(blob, {
    status: 200,
    headers: { "Content-Type": contentType, "Content-Disposition": contentDisposition },
  });
}
