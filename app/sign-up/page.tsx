import Link from 'next/link';
import { signUp } from '@/app/auth/actions';

export default function SignUpPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <form action={signUp} className="glass w-full max-w-sm rounded-2xl p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Join ScentOS</p>
        <h1 className="mt-2 font-display text-2xl text-bone">Create your account</h1>

        {searchParams.error && <p className="mt-4 text-sm text-red-400">{searchParams.error}</p>}

        <input name="name" placeholder="Name" className="input mt-6" />
        <input name="email" type="email" placeholder="Email" required className="input mt-3" />
        <input name="password" type="password" placeholder="Password (min 6 characters)" required minLength={6} className="input mt-3" />

        <button type="submit" className="mt-6 w-full rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-matte">
          Sign up
        </button>

        <p className="mt-5 text-center text-sm text-ash">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-electric">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
