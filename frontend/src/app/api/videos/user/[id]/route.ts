import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("auth")?.value;
  const { id } = await params;
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/videos/user/${id}`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  
  const text = await res.text();
  let data: any;
  try { 
    data = JSON.parse(text); 
  } catch { 
    data = { error: text || "Internal Server Error" }; 
  }
  
  return NextResponse.json(data, { status: res.status });
}
