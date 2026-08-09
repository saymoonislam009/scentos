export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="h-4 w-24 animate-pulse rounded-full bg-obsidian2 mb-6" />
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-4">
          <div className="h-3 w-20 animate-pulse rounded-full bg-obsidian2" />
          <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-obsidian2" />
          <div className="h-3 w-40 animate-pulse rounded-full bg-obsidian2" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-full bg-obsidian2" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-obsidian2" />)}
      </div>
    </div>
  );
}
