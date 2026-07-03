import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Invalid admin secret' }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
