import { NextRequest, NextResponse } from 'next/server';

/**
 * Single shared-secret gate for /api/admin/* routes — mirrors the guard
 * used in the earlier NestJS build. Not Supabase Auth: there's one solo
 * operator, so one secret checked against the ADMIN_SECRET env var.
 * Returns a 401 response to return early, or null if the secret is valid.
 */
export function checkAdminSecret(req: NextRequest): NextResponse | null {
  const provided = req.headers.get('x-admin-secret');
  const expected = process.env.ADMIN_SECRET;

  if (!expected) {
    return NextResponse.json({ error: 'Admin panel is not configured (ADMIN_SECRET unset)' }, { status: 401 });
  }
  if (provided !== expected) {
    return NextResponse.json({ error: 'Invalid admin secret' }, { status: 401 });
  }
  return null;
}
