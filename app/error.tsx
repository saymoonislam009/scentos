'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-ember/15 text-ember"><AlertTriangle size={20} /></div>
        <h1 className="font-display text-3xl text-bone">Something went wrong.</h1>
        <p className="mt-3 text-sm text-ash">An unexpected error occurred. You can try again, or head back home.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button onClick={reset} className="btn-gold">Try again</button>
          <Link href="/" className="btn-ghost">Back home</Link>
        </div>
      </div>
    </div>
  );
}
