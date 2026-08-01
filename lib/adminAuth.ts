import { NextRequest, NextResponse } from 'next/server';
export function checkAdminSecret(req: NextRequest): NextResponse | null {
  const p = req.headers.get('x-admin-secret');
  const e = process.env.ADMIN_SECRET;
  if (!e) return NextResponse.json({ error: 'ADMIN_SECRET not configured' }, { status: 401 });
  if (p !== e) return NextResponse.json({ error: 'Invalid admin secret' }, { status: 401 });
  return null;
}
