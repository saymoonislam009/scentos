import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center">
        <p className="section-label mb-4">404</p>
        <h1 className="font-display text-4xl text-bone sm:text-5xl">Not on the shelf.</h1>
        <p className="mt-4 max-w-sm mx-auto text-ash">The page you&rsquo;re looking for doesn&rsquo;t exist, or has been moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn-gold">Back home</Link>
          <Link href="/database" className="btn-ghost">Browse catalog</Link>
        </div>
      </div>
    </div>
  );
}
