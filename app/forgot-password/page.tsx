import Link from 'next/link';
import { Mail } from 'lucide-react';
import { requestPasswordReset } from '@/app/auth/actions';

export default function ForgotPasswordPage({ searchParams }: { searchParams: { sent?: string } }) {
  if (searchParams.sent) return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold/12 text-gold"><Mail size={20} /></div>
        <p className="font-display text-2xl text-bone">Check your email.</p>
        <p className="mt-3 text-sm leading-relaxed text-ash">If an account exists for that address, we've sent a link to reset your password. It expires in a hour.</p>
        <Link href="/sign-in" className="btn-ghost mt-8 inline-flex">Back to sign in</Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl text-bone">Reset your password.</p>
          <p className="mt-2 text-sm text-ash">Enter your email and we'll send a reset link.</p>
        </div>
        <form action={requestPasswordReset} className="glass space-y-4 rounded-2xl p-8">
          <div>
            <label className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Email</label>
            <input name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com" />
          </div>
          <button type="submit" className="btn-gold mt-2 w-full justify-center">Send reset link</button>
        </form>
        <p className="mt-5 text-center text-sm text-ash"><Link href="/sign-in" className="text-gold hover:text-gold-soft">← Back to sign in</Link></p>
      </div>
    </div>
  );
}
