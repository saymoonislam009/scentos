'use client';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts';

export function TopBrandsChart({ data }: { data: { name: string; count: number }[] }) {
  if (!data?.length) return <p className="text-sm text-ash">No data yet.</p>;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#9C9488', fontSize: 11, fontFamily: 'var(--font-jetbrains)' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: '#12110D', border: '1px solid rgba(237,232,223,0.1)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#EDE8DF' }} cursor={{ fill: 'rgba(201,162,75,0.06)' }} />
          <Bar dataKey="count" fill="#C9A24B" radius={[0, 4, 4, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityTrendChart({ data }: { data: { date: string; count: number }[] }) {
  if (!data?.length) return <p className="text-sm text-ash">No data yet.</p>;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -20, right: 8 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C9A24B" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#C9A24B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(237,232,223,0.05)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#9C9488', fontSize: 10, fontFamily: 'var(--font-jetbrains)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9C9488', fontSize: 10, fontFamily: 'var(--font-jetbrains)' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ background: '#12110D', border: '1px solid rgba(237,232,223,0.1)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#EDE8DF' }} />
          <Area type="monotone" dataKey="count" stroke="#C9A24B" strokeWidth={2} fill="url(#colorCount)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
