import Link from 'next/link';
import {signIn} from '@/app/auth/actions';
export default function SignInPage({searchParams}:{searchParams:{error?:string;confirm?:string}}) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center"><p className="font-display text-3xl text-bone">Welcome back.</p><p className="mt-2 text-sm text-ash">Sign in to your ScentOS account</p></div>
        <form action={signIn} className="glass rounded-2xl p-8 space-y-4">
          {searchParams.confirm&&<div className="rounded-xl bg-electric/10 border border-electric/20 p-3 text-sm text-electric">Check your email to confirm, then sign in.</div>}
          {searchParams.error&&<div className="rounded-xl bg-ember/10 border border-ember/20 p-3 text-sm text-ember">{searchParams.error}</div>}
          <div><label className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Email</label><input name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com"/></div>
          <div><label className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Password</label><input name="password" type="password" required autoComplete="current-password" className="input" placeholder="••••••••"/></div>
          <div className="text-right"><Link href="/forgot-password" className="font-mono text-2xs text-ash hover:text-gold">Forgot password?</Link></div>
          <button type="submit" className="btn-gold w-full justify-center mt-2">Sign in</button>
        </form>
        <p className="mt-5 text-center text-sm text-ash">No account? <Link href="/sign-up" className="text-gold hover:text-gold-soft">Create one</Link></p>
      </div>
    </div>
  );
}
