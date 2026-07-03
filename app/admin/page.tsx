'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const STORAGE_KEY = 'scentos_admin_secret';

type Tab = 'overview' | 'fragrances' | 'orders' | 'users' | 'partial-listings' | 'reports';

export default function AdminPage() {
  const [secret, setSecret] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setSecret(stored);
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!secret) return <AdminLogin onSuccess={(s) => { window.localStorage.setItem(STORAGE_KEY, s); setSecret(s); }} />;

  return <AdminDashboard secret={secret} onLogout={() => { window.localStorage.removeItem(STORAGE_KEY); setSecret(null); }} />;
}

function AdminLogin({ onSuccess }: { onSuccess: (secret: string) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminLogin(value);
      if (res.ok) onSuccess(value);
    } catch {
      setError('Invalid secret.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <form onSubmit={submit} className="glass w-full max-w-sm rounded-2xl p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Private</p>
        <h1 className="mt-2 font-display text-2xl text-bone">Admin access</h1>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Secret"
          autoFocus
          className="input mt-6"
        />
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !value}
          className="mt-6 w-full rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-matte disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}

function AdminDashboard({ secret, onLogout }: { secret: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('overview');
  const tabs: Tab[] = ['overview', 'fragrances', 'orders', 'users', 'partial-listings', 'reports'];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Private</p>
          <h1 className="mt-2 font-display text-3xl text-bone">Admin panel</h1>
        </div>
        <button onClick={onLogout} className="text-sm text-ash hover:text-bone">
          Log out
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-bone/10">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm capitalize transition-colors ${
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
      </div>
    </div>
  );
}

function Overview({ secret }: { secret: string }) {
  const [stats, setStats] = useState<any | null>(null);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);

  useEffect(() => {
    api.adminStats(secret).then(setStats).catch(() => setStats(null));
  }, [secret]);

  async function backfill() {
    setBackfilling(true);
    setBackfillResult(null);
    try {
      const res = await api.adminBackfillEmbeddings(secret);
      setBackfillResult(`Updated ${res.updated} of ${res.total ?? 0} fragrances.`);
    } catch (e: any) {
      setBackfillResult(`Failed: ${e.message}`);
    } finally {
      setBackfilling(false);
    }
  }

  if (!stats) return <p className="text-ash">Loading…</p>;

  const cards = [
    { label: 'Fragrances', value: stats.fragrances },
    { label: 'Brands', value: stats.brands },
    { label: 'Users', value: stats.users },
    { label: 'Orders', value: stats.orders },
    { label: 'Active decant listings', value: stats.activeListings },
    { label: 'Active partial-bottle listings', value: stats.partialListings },
    { label: 'Reviews', value: stats.reviews },
    { label: 'Open reports', value: stats.openReports },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-ash">{c.label}</p>
            <p className="mt-2 font-display text-3xl text-gold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="glass mt-6 rounded-2xl p-5">
        <p className="text-sm text-bone">Fragrance Genome embeddings</p>
        <p className="mt-1 text-xs text-ash">
          Run this after seeding or adding fragrances — generates OpenAI embeddings for any fragrance
          missing one, which powers the Genome similarity feature.
        </p>
        <button
          onClick={backfill}
          disabled={backfilling}
          className="mt-3 rounded-full bg-gold/15 px-4 py-2 text-sm text-gold disabled:opacity-50"
        >
          {backfilling ? 'Backfilling…' : 'Backfill embeddings'}
        </button>
        {backfillResult && <p className="mt-2 text-xs text-ash">{backfillResult}</p>}
      </div>
    </div>
  );
}

function Fragrances({ secret }: { secret: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', brandName: '', priceTierUsd: '', concentration: '' });
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    api.adminListFragrances(secret).then(setItems).finally(() => setLoading(false));
  }

  useEffect(refresh, [secret]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.adminCreateFragrance(
        {
          name: form.name,
          brandName: form.brandName,
          concentration: form.concentration || undefined,
          priceTierUsd: form.priceTierUsd ? Number(form.priceTierUsd) : undefined,
        },
        secret,
      );
      setForm({ name: '', brandName: '', priceTierUsd: '', concentration: '' });
      refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this fragrance? This cannot be undone.')) return;
    await api.adminDeleteFragrance(id, secret);
    refresh();
  }

  async function toggleDiscontinued(id: string) {
    await api.adminUpdateFragrance(id, { toggleDiscontinued: true }, secret);
    refresh();
  }

  return (
    <div>
      <form onSubmit={create} className="glass mb-8 grid gap-3 rounded-2xl p-6 sm:grid-cols-4">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input"
          required
        />
        <input
          placeholder="Brand"
          value={form.brandName}
          onChange={(e) => setForm({ ...form, brandName: e.target.value })}
          className="input"
          required
        />
        <input
          placeholder="Concentration (EDT/EDP)"
          value={form.concentration}
          onChange={(e) => setForm({ ...form, concentration: e.target.value })}
          className="input"
        />
        <input
          placeholder="Price tier (USD)"
          type="number"
          value={form.priceTierUsd}
          onChange={(e) => setForm({ ...form, priceTierUsd: e.target.value })}
          className="input"
        />
        <button type="submit" className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-matte sm:col-span-4">
          Add fragrance
        </button>
        {error && <p className="text-sm text-red-400 sm:col-span-4">{error}</p>}
      </form>

      {loading ? (
        <p className="text-ash">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-ash">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Brand</th>
                <th className="py-2">Price tier</th>
                <th className="py-2">Embedding</th>
                <th className="py-2">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.id} className="border-t border-bone/10">
                  <td className="py-2 text-bone">{f.name}</td>
                  <td className="py-2 text-ash">{f.brands?.name}</td>
                  <td className="py-2 font-mono text-ash">{f.price_tier_usd ? `$${f.price_tier_usd}` : '—'}</td>
                  <td className="py-2 text-ash">{f.embedding ? '✓' : '—'}</td>
                  <td className="py-2">
                    <button onClick={() => toggleDiscontinued(f.id)} className="text-xs text-electric">
                      {f.discontinued ? 'Discontinued' : 'Active'}
                    </button>
                  </td>
                  <td className="py-2 text-right">
                    <button onClick={() => remove(f.id)} className="text-xs text-red-400">
                      Delete
                    </button>
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

function Orders({ secret }: { secret: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminListOrders(secret).then(setOrders).finally(() => setLoading(false));
  }, [secret]);

  if (loading) return <p className="text-ash">Loading…</p>;
  if (orders.length === 0) return <p className="text-ash">No orders yet.</p>;

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="hairline flex items-center justify-between rounded-xl p-4 text-sm">
          <div>
            <p className="text-bone">{o.decant_listings?.fragrances?.name}</p>
            <p className="text-xs text-ash">
              {o.buyer?.name ?? o.buyer?.email} → {o.seller?.name ?? o.seller?.email}
            </p>
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

function Users({ secret }: { secret: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminListUsers(secret).then(setUsers).finally(() => setLoading(false));
  }, [secret]);

  if (loading) return <p className="text-ash">Loading…</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-ash">
          <tr>
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Country</th>
            <th className="py-2">Collection items</th>
            <th className="py-2">Reviews</th>
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

function PartialListings({ secret }: { secret: string }) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    api.adminListPartialListings(secret).then(setListings).finally(() => setLoading(false));
  }

  useEffect(refresh, [secret]);

  async function setStatus(id: string, status: string) {
    await api.adminUpdatePartialListing(id, { status }, secret);
    refresh();
  }

  if (loading) return <p className="text-ash">Loading…</p>;
  if (listings.length === 0) return <p className="text-ash">No partial bottle listings yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-ash">
          <tr>
            <th className="py-2">Bottle</th>
            <th className="py-2">Seller</th>
            <th className="py-2">Price</th>
            <th className="py-2">Inquiries</th>
            <th className="py-2">Reports</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id} className="border-t border-bone/10">
              <td className="py-2 text-bone">{l.perfume_name}</td>
              <td className="py-2 text-ash">{l.profiles?.name ?? l.profiles?.email}</td>
              <td className="py-2 font-mono text-ash">{l.currency} {Number(l.price).toFixed(0)}</td>
              <td className="py-2 text-electric">{l.inquiry_count}</td>
              <td className={`py-2 ${l.report_count > 0 ? 'text-red-400' : 'text-ash'}`}>{l.report_count}</td>
              <td className="py-2 text-ash">{l.status}</td>
              <td className="py-2 text-right">
                {l.status === 'active' ? (
                  <button onClick={() => setStatus(l.id, 'removed')} className="text-xs text-red-400">
                    Remove
                  </button>
                ) : (
                  <button onClick={() => setStatus(l.id, 'active')} className="text-xs text-electric">
                    Restore
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Reports({ secret }: { secret: string }) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<'none' | 'user' | 'listing'>('none');

  function refresh() {
    setLoading(true);
    api.adminListReports(secret).then(setReports).finally(() => setLoading(false));
  }

  useEffect(refresh, [secret]);

  async function setStatus(id: string, status: string) {
    await api.adminUpdateReport(id, { status }, secret);
    refresh();
  }

  if (loading) return <p className="text-ash">Loading…</p>;
  if (reports.length === 0) return <p className="text-ash">No reports filed.</p>;

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

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(['none', 'user', 'listing'] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGroupBy(g)}
            className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
              groupBy === g ? 'bg-gold text-matte' : 'bg-bone/5 text-ash hover:bg-bone/10'
            }`}
          >
            {g === 'none' ? 'All reports' : `By ${g}`}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {[...groups.entries()].map(([key, group]) => (
          <div key={key}>
            {groupBy !== 'none' && <p className="mb-2 text-xs uppercase tracking-wider text-ash">{key}</p>}
            <div className="space-y-3">
              {group.map((r) => (
                <div key={r.id} className="hairline rounded-xl p-4 text-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-bone">{r.reason}</p>
                      {r.details && <p className="mt-1 text-xs text-ash">{r.details}</p>}
                      <p className="mt-2 text-xs text-ash">
                        Filed by {r.reporter?.name ?? r.reporter?.email}
                        {r.partial_bottle_listings && <> · on &ldquo;{r.partial_bottle_listings.perfume_name}&rdquo;</>}
                        {r.reported_user && <> · against {r.reported_user.name ?? r.reported_user.email}</>}
                      </p>
                    </div>
                    <select
                      value={r.status}
                      onChange={(e) => setStatus(r.id, e.target.value)}
                      className="input w-auto py-1 text-xs"
                    >
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
