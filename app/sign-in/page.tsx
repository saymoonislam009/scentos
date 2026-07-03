import Link from 'next/link';
import { signIn } from '@/app/auth/actions';

export default function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string; confirm?: string };
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <form action={signIn} className="glass w-full max-w-sm rounded-2xl p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Welcome back</p>
        <h1 className="mt-2 font-display text-2xl text-bone">Sign in</h1>

        {searchParams.confirm && (
          <p className="mt-4 rounded-lg bg-electric/10 p-3 text-sm text-electric">
            Check your email to confirm your account, then sign in.
          </p>
        )}
        {searchParams.error && <p className="mt-4 text-sm text-red-400">{searchParams.error}</p>}

        <input name="email" type="email" placeholder="Email" required className="input mt-6" />
        <input name="password" type="password" placeholder="Password" required className="input mt-3" />

        <button type="submit" className="mt-6 w-full rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-matte">
          Sign in
        </button>

        <p className="mt-5 text-center text-sm text-ash">
          No account?{' '}
          <Link href="/sign-up" className="text-electric">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
