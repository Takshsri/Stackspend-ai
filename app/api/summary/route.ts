import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  return NextResponse.json({
    summary: "Your AI stack has optimization opportunities.",
  });
}