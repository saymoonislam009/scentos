'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The Supabase client auto-exchanges the recovery token in the URL for a
    // temporary session on mount. Give it a moment, then check.
    const s = createClient();
    const t = setTimeout(async () => {
      const { data } = await s.auth.getSession();
      if (data.session) setReady(true); else setInvalid(true);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setSubmitting(true);
    const s = createClient();
    const { error: err } = await s.auth.updateUser({ password });
    setSubmitting(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => router.push('/sign-in'), 2000);
  }

  if (done) return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 text-center">
      <div>
        <p className="font-display text-2xl text-bone">Password updated.</p>
        <p className="mt-2 text-sm text-ash">Redirecting you to sign in…</p>
      </div>
    </div>
  );

  if (invalid) return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 text-center">
      <div className="max-w-sm">
        <p className="font-display text-2xl text-bone">This link has expired.</p>
        <p className="mt-2 text-sm text-ash">Password reset links only work once and expire after an hour.</p>
        <Link href="/forgot-password" className="btn-gold mt-6 inline-flex">Request a new link</Link>
      </div>
    </div>
  );

  if (!ready) return <div className="flex min-h-[80vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl text-bone">Set a new password.</p>
        </div>
        <form onSubmit={submit} className="glass space-y-4 rounded-2xl p-8">
          <div>
            <label className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">New password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" minLength={8} className="input" placeholder="••••••••" />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Confirm password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" minLength={8} className="input" placeholder="••••••••" />
          </div>
          {error && <p className="text-sm text-ember">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-gold mt-2 w-full justify-center disabled:opacity-50">{submitting ? 'Updating…' : 'Update password'}</button>
        </form>
      </div>
    </div>
  );
}
