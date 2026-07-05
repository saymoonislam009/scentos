'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

// Admin is accessed via /admin/your-secret — the URL itself is the gate.
// No password form, no localStorage — if you know the URL you're in,
// if you don't, the page shows nothing useful.

type Tab = 'overview' | 'fragrances' | 'orders' | 'users' | 'partial-listings' | 'reports' | 'import';

export default function AdminPage() {
  const params = useParams();
  const router = useRouter();
  const secret = Array.isArray(params.secret) ? params.secret[0] : params.secret;
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    api.adminLogin(secret).then((r) => {
      if (r.ok) setAuthed(true);
      else router.replace('/');
    }).catch(() => router.replace('/'));
  }, [secret, router]);

  if (!authed) return <div className="py-32 text-center text-ash">Checking…</div>;

  const tabs: Tab[] = ['overview', 'fragrances', 'orders', 'users', 'partial-listings', 'reports', 'import'];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Private</p>
          <h1 className="mt-1 font-display text-3xl text-bone">Admin panel</h1>
        </div>
        <span className="font-mono text-xs text-ash">ScentOS</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-bone/10">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2.5 text-sm capitalize transition-colors ${
              tab === t ? 'border-b-2 border-gold text-bone' : 'text-ash hover:text-bone'
            }`}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'overview' && <Overview secret={secret} />}
        {tab === 'fragrances' && <Fragrances secret={secret} />}
        {tab === 'orders' && <Orders secret={secret} />}
        {tab === 'users' && <Users secret={secret} />}
        {tab === 'partial-listings' && <PartialListings secret={secret} />}
        {tab === 'reports' && <Reports secret={secret} />}
        {tab === 'import' && <Import secret={secret} />}
      </div>
    </div>
  );
}

/* ─── Overview ─── */
function Overview({ secret }: { secret: string }) {
  const [stats, setStats] = useState<any>(null);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillMsg, setBackfillMsg] = useState<string | null>(null);

  useEffect(() => { api.adminStats(secret).then(setStats).catch(() => {}); }, [secret]);

  async function backfill() {
    setBackfilling(true); setBackfillMsg(null);
    try {
      const r = await api.adminBackfillEmbeddings(secret);
      setBackfillMsg(`Updated ${r.updated} of ${r.total ?? 0} fragrances.`);
    } catch (e: any) { setBackfillMsg(`Failed: ${e.message}`); }
    finally { setBackfilling(false); }
  }

  if (!stats) return <p className="text-ash">Loading…</p>;

  const cards = [
    { label: 'Fragrances', value: stats.fragrances },
    { label: 'Brands', value: stats.brands },
    { label: 'Users', value: stats.users },
    { label: 'Orders', value: stats.orders },
    { label: 'Active decant listings', value: stats.activeListings },
    { label: 'Active partial listings', value: stats.partialListings },
    { label: 'Reviews', value: stats.reviews },
    { label: 'Open reports', value: stats.openReports },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-ash">{c.label}</p>
            <p className="mt-2 font-display text-3xl text-gold">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl p-5">
        <p className="text-sm font-medium text-bone">Fragrance Genome embeddings</p>
        <p className="mt-1 text-xs text-ash">Run after seeding or adding fragrances to activate Genome similarity.</p>
        <button onClick={backfill} disabled={backfilling}
          className="mt-3 rounded-full bg-gold/15 px-4 py-2 text-sm text-gold disabled:opacity-50">
          {backfilling ? 'Backfilling…' : 'Backfill embeddings'}
        </button>
        {backfillMsg && <p className="mt-2 text-xs text-ash">{backfillMsg}</p>}
      </div>
    </div>
  );
}

/* ─── Fragrances ─── */
function Fragrances({ secret }: { secret: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', brandName: '', priceTierUsd: '', concentration: '', description: '', seasons: '', occasions: '' });
  const [editing, setEditing] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => { setLoading(true); api.adminListFragrances(secret).then(setItems).finally(() => setLoading(false)); };
  useEffect(refresh, [secret]);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    try {
      await api.adminCreateFragrance({
        name: form.name, brandName: form.brandName,
        concentration: form.concentration || undefined,
        priceTierUsd: form.priceTierUsd ? Number(form.priceTierUsd) : undefined,
        description: form.description || undefined,
        seasons: form.seasons ? form.seasons.split(',').map(s => s.trim()) : [],
        occasions: form.occasions ? form.occasions.split(',').map(s => s.trim()) : [],
      }, secret);
      setForm({ name: '', brandName: '', priceTierUsd: '', concentration: '', description: '', seasons: '', occasions: '' });
      refresh();
    } catch (e: any) { setError(e.message); }
  }

  async function saveEdit() {
    if (!editing) return;
    try {
      await api.adminUpdateFragrance(editing.id, {
        name: editing.name, description: editing.description,
        price_tier_usd: editing.price_tier_usd,
        concentration: editing.concentration,
        seasons: typeof editing.seasons === 'string' ? editing.seasons.split(',').map((s: string) => s.trim()) : editing.seasons,
        occasions: typeof editing.occasions === 'string' ? editing.occasions.split(',').map((s: string) => s.trim()) : editing.occasions,
      }, secret);
      setEditing(null); refresh();
    } catch (e: any) { setError(e.message); }
  }

  return (
    <div className="space-y-6">
      {editing && (
        <div className="glass rounded-2xl p-6">
          <p className="mb-4 text-sm font-medium text-bone">Editing: {editing.name}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: 'name', label: 'Name' },
              { key: 'concentration', label: 'Concentration' },
              { key: 'price_tier_usd', label: 'Price tier (USD)', type: 'number' },
              { key: 'seasons', label: 'Seasons (comma separated)' },
              { key: 'occasions', label: 'Occasions (comma separated)' },
            ].map(({ key, label, type }) => (
              <label key={key} className="block">
                <span className="mb-1 block text-xs text-ash">{label}</span>
                <input type={type || 'text'} value={Array.isArray(editing[key]) ? editing[key].join(', ') : editing[key] ?? ''}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value })} className="input" />
              </label>
            ))}
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs text-ash">Description</span>
              <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="input min-h-[80px] resize-none" />
            </label>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={saveEdit} className="rounded-full bg-gold px-5 py-2 text-sm font-medium text-matte">Save</button>
            <button onClick={() => setEditing(null)} className="text-sm text-ash">Cancel</button>
          </div>
        </div>
      )}

      <form onSubmit={create} className="glass grid gap-3 rounded-2xl p-6 sm:grid-cols-3">
        <p className="text-sm font-medium text-bone sm:col-span-3">Add fragrance</p>
        {[
          { key: 'name', label: 'Name', required: true },
          { key: 'brandName', label: 'Brand', required: true },
          { key: 'concentration', label: 'EDT / EDP / Parfum' },
          { key: 'priceTierUsd', label: 'Price tier (USD)', type: 'number' },
          { key: 'seasons', label: 'Seasons (spring,summer…)' },
          { key: 'occasions', label: 'Occasions (office,casual…)' },
        ].map(({ key, label, required, type }) => (
          <label key={key} className="block">
            <span className="mb-1 block text-xs text-ash">{label}</span>
            <input type={type || 'text'} required={required}
              value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input" />
          </label>
        ))}
        <label className="block sm:col-span-3">
          <span className="mb-1 block text-xs text-ash">Description</span>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input min-h-[70px] resize-none" />
        </label>
        {error && <p className="text-sm text-red-400 sm:col-span-3">{error}</p>}
        <button type="submit" className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-matte sm:col-span-3">
          Add fragrance
        </button>
      </form>

      {loading ? <p className="text-ash">Loading…</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-ash">
              <tr>
                <th className="py-2">Name</th><th className="py-2">Brand</th>
                <th className="py-2">Price</th><th className="py-2">Embedding</th>
                <th className="py-2">Status</th><th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.id} className="border-t border-bone/10">
                  <td className="py-2 text-bone">{f.name}</td>
                  <td className="py-2 text-ash">{f.brands?.name}</td>
                  <td className="py-2 font-mono text-ash">{f.price_tier_usd ? `$${f.price_tier_usd}` : '—'}</td>
                  <td className="py-2 text-ash">{f.embedding ? <span className="text-electric">✓</span> : '—'}</td>
                  <td className="py-2">
                    <button onClick={() => api.adminUpdateFragrance(f.id, { toggleDiscontinued: true }, secret).then(refresh)}
                      className={`text-xs ${f.discontinued ? 'text-red-400' : 'text-electric'}`}>
                      {f.discontinued ? 'Discontinued' : 'Active'}
                    </button>
                  </td>
                  <td className="py-2 text-right">
                    <button onClick={() => setEditing(f)} className="mr-3 text-xs text-bone">Edit</button>
                    <button onClick={() => { if (confirm('Delete?')) api.adminDeleteFragrance(f.id, secret).then(refresh); }}
                      className="text-xs text-red-400">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Orders ─── */
function Orders({ secret }: { secret: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.adminListOrders(secret).then(setOrders).finally(() => setLoading(false)); }, [secret]);

  if (loading) return <p className="text-ash">Loading…</p>;
  if (!orders.length) return <p className="text-ash">No orders yet.</p>;

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="hairline flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 text-sm">
          <div>
            <p className="text-bone">{o.decant_listings?.fragrances?.name}</p>
            <p className="text-xs text-ash">{o.buyer?.name ?? o.buyer?.email} → {o.seller?.name ?? o.seller?.email}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-gold">${Number(o.amount).toFixed(2)}</p>
            <p className="text-xs uppercase tracking-wider text-ash">{o.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Users ─── */
function Users({ secret }: { secret: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.adminListUsers(secret).then(setUsers).finally(() => setLoading(false)); }, [secret]);

  if (loading) return <p className="text-ash">Loading…</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-ash">
          <tr>
            <th className="py-2">Name</th><th className="py-2">Email</th>
            <th className="py-2">Country</th><th className="py-2">Collection</th><th className="py-2">Reviews</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-bone/10">
              <td className="py-2 text-bone">{u.name ?? '—'}</td>
              <td className="py-2 text-ash">{u.email}</td>
              <td className="py-2 text-ash">{u.country ?? '—'}</td>
              <td className="py-2 text-ash">{u.collection_count}</td>
              <td className="py-2 text-ash">{u.review_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Partial Listings ─── */
function PartialListings({ secret }: { secret: string }) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => { setLoading(true); api.adminListPartialListings(secret).then(setListings).finally(() => setLoading(false)); };
  useEffect(refresh, [secret]);

  if (loading) return <p className="text-ash">Loading…</p>;
  if (!listings.length) return <p className="text-ash">No partial bottle listings yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-ash">
          <tr>
            <th className="py-2">Bottle</th><th className="py-2">Seller</th><th className="py-2">Price</th>
            <th className="py-2">Inquiries</th><th className="py-2">Reports</th><th className="py-2">Status</th><th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id} className="border-t border-bone/10">
              <td className="py-2 text-bone">{l.perfume_name}</td>
              <td className="py-2 text-ash">{l.profiles?.name ?? l.profiles?.email}</td>
              <td className="py-2 font-mono text-ash">{l.currency} {Number(l.price).toFixed(0)}</td>
              <td className="py-2 text-electric">{l.inquiry_count}</td>
              <td className={`py-2 ${l.report_count > 0 ? 'text-red-400 font-bold' : 'text-ash'}`}>{l.report_count}</td>
              <td className="py-2 text-ash">{l.status}</td>
              <td className="py-2 text-right">
                {l.status === 'active'
                  ? <button onClick={() => api.adminUpdatePartialListing(l.id, { status: 'removed' }, secret).then(refresh)} className="text-xs text-red-400">Remove</button>
                  : <button onClick={() => api.adminUpdatePartialListing(l.id, { status: 'active' }, secret).then(refresh)} className="text-xs text-electric">Restore</button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Reports ─── */
function Reports({ secret }: { secret: string }) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<'none' | 'user' | 'listing'>('none');

  const refresh = () => { setLoading(true); api.adminListReports(secret).then(setReports).finally(() => setLoading(false)); };
  useEffect(refresh, [secret]);

  const groups = new Map<string, any[]>();
  if (groupBy === 'none') {
    groups.set('all', reports);
  } else if (groupBy === 'user') {
    for (const r of reports) {
      const key = r.reported_user?.name ?? r.reported_user?.email ?? 'Unknown user';
      groups.set(key, [...(groups.get(key) ?? []), r]);
    }
  } else {
    for (const r of reports) {
      const key = r.partial_bottle_listings?.perfume_name ?? 'Unknown listing';
      groups.set(key, [...(groups.get(key) ?? []), r]);
    }
  }

  if (loading) return <p className="text-ash">Loading…</p>;
  if (!reports.length) return <p className="text-ash">No reports filed.</p>;

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(['none', 'user', 'listing'] as const).map((g) => (
          <button key={g} onClick={() => setGroupBy(g)}
            className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
              groupBy === g ? 'bg-gold text-matte' : 'bg-bone/5 text-ash hover:bg-bone/10'
            }`}>
            {g === 'none' ? 'All reports' : `By ${g}`}
          </button>
        ))}
      </div>
      <div className="space-y-6">
        {[...groups.entries()].map(([key, group]) => (
          <div key={key}>
            {groupBy !== 'none' && <p className="mb-2 text-xs uppercase tracking-wider text-ash">{key} ({group.length})</p>}
            <div className="space-y-3">
              {group.map((r) => (
                <div key={r.id} className="hairline rounded-xl p-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-bone">{r.reason}</p>
                      {r.details && <p className="mt-1 text-xs text-ash">{r.details}</p>}
                      <p className="mt-2 text-xs text-ash">
                        By {r.reporter?.name ?? r.reporter?.email}
                        {r.partial_bottle_listings && <> · &ldquo;{r.partial_bottle_listings.perfume_name}&rdquo;</>}
                        {r.reported_user && <> · against {r.reported_user.name ?? r.reported_user.email}</>}
                      </p>
                    </div>
                    <select value={r.status} onChange={(e) => api.adminUpdateReport(r.id, { status: e.target.value }, secret).then(refresh)}
                      className="input w-auto shrink-0 py-1 text-xs">
                      <option value="open">Open</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CSV Import ─── */
function Import({ secret }: { secret: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function parseCSV(text: string) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
    return lines.slice(1).filter(Boolean).map((line) => {
      const vals = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
    });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const text = await f.text();
    setPreview(parseCSV(text).slice(0, 5));
  }

  async function doImport() {
    if (!file) return;
    setImporting(true); setError(null); setResult(null);
    const text = await file.text();
    const rows = parseCSV(text);
    let ok = 0, fail = 0;
    for (const row of rows) {
      try {
        await api.adminCreateFragrance({
          name: row.name,
          brandName: row.brand || row.brand_name,
          concentration: row.concentration,
          description: row.description,
          priceTierUsd: row.price_tier_usd ? Number(row.price_tier_usd) : undefined,
          releaseYear: row.release_year ? Number(row.release_year) : undefined,
          seasons: row.seasons ? row.seasons.split('|').map((s: string) => s.trim()) : [],
          occasions: row.occasions ? row.occasions.split('|').map((s: string) => s.trim()) : [],
        }, secret);
        ok++;
      } catch { fail++; }
    }
    setResult(`Imported ${ok} fragrances. ${fail > 0 ? `${fail} failed.` : ''}`);
    setImporting(false);
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg text-bone">Bulk import via CSV</h2>
        <p className="mt-2 text-sm text-ash">
          Upload a CSV file to add multiple fragrances at once. Use <code className="text-electric">|</code> (pipe) to separate
          multiple values in the seasons and occasions columns.
        </p>

        <div className="mt-4 rounded-xl border border-bone/10 p-4">
          <p className="font-mono text-xs text-ash">Required columns:</p>
          <p className="mt-1 font-mono text-xs text-electric">name, brand</p>
          <p className="mt-2 font-mono text-xs text-ash">Optional columns:</p>
          <p className="mt-1 font-mono text-xs text-bone">
            concentration, description, price_tier_usd, release_year, seasons, occasions
          </p>
          <p className="mt-3 font-mono text-xs text-ash">Example row:</p>
          <p className="mt-1 font-mono text-xs text-bone break-all">
            Sauvage EDT,Dior,EDT,A bold fresh scent,95,2015,spring|summer|fall,office|casual
          </p>
        </div>

        <input type="file" accept=".csv" onChange={onFile} className="mt-4 block text-sm text-ash" />

        {preview.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs text-ash">Preview (first 5 rows):</p>
            <div className="overflow-x-auto rounded-xl border border-bone/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-bone/5">
                  <tr>
                    {Object.keys(preview[0]).map((k) => (
                      <th key={k} className="px-3 py-2 text-ash">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-bone/10">
                      {Object.values(row).map((v: any, j) => (
                        <td key={j} className="px-3 py-2 text-bone">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {file && (
          <button onClick={doImport} disabled={importing}
            className="mt-4 rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-matte disabled:opacity-50">
            {importing ? 'Importing…' : `Import ${file.name}`}
          </button>
        )}

        {result && <p className="mt-3 text-sm text-electric">{result}</p>}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
