import Link from 'next/link';
import {signUp} from '@/app/auth/actions';
export default function SignUpPage({searchParams}:{searchParams:{error?:string}}) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center"><p className="font-display text-3xl text-bone">Join ScentOS.</p><p className="mt-2 text-sm text-ash">Your fragrance journey starts here</p></div>
        <form action={signUp} className="glass rounded-2xl p-8 space-y-4">
          {searchParams.error&&<div className="rounded-xl bg-ember/10 border border-ember/20 p-3 text-sm text-ember">{searchParams.error}</div>}
          <div><label className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Name</label><input name="name" type="text" autoComplete="name" className="input" placeholder="Your name"/></div>
          <div><label className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Email</label><input name="email" type="email" required autoComplete="email" className="input" placeholder="you@example.com"/></div>
          <div><label className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Password</label><input name="password" type="password" required minLength={6} autoComplete="new-password" className="input" placeholder="Min 6 characters"/></div>
          <button type="submit" className="btn-gold w-full justify-center mt-2">Create account</button>
        </form>
        <p className="mt-5 text-center text-sm text-ash">Have an account? <Link href="/sign-in" className="text-gold hover:text-gold-soft">Sign in</Link></p>
      </div>
    </div>
  );
}
