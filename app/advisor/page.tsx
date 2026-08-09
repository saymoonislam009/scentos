'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
type F = { age:string; gender:string; budgetUsd:string; country:string; climate:string; favoriteFragrances:string; favoriteNotes:string; performance:string };
const STEPS = ['About you','Where you are','Your taste','Performance'] as const;
const CLIMATES = [{v:'hot-humid',l:'Hot & humid'},{v:'hot-dry',l:'Hot & dry'},{v:'temperate',l:'Temperate'},{v:'cold',l:'Cold'}];
const PERF = [{v:'intimate',l:'Intimate',d:'Just for you'},{v:'moderate',l:'Moderate',d:"Arm's length"},{v:'strong',l:'Strong',d:'Fills the room'},{v:'beast-mode',l:'Beast mode',d:'Turns heads'}];
export default function AdvisorPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<F>({ age:'', gender:'no-preference', budgetUsd:'100', country:'', climate:'hot-humid', favoriteFragrances:'', favoriteNotes:'', performance:'moderate' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const upd = (k: keyof F, v: string) => setForm(f => ({ ...f, [k]: v }));
  async function submit() {
    setLoading(true); setError('');
    try { const d = await api.getAdvice({ age: Number(form.age), gender: form.gender, budgetUsd: Number(form.budgetUsd), country: form.country, climate: form.climate, favoriteFragrances: form.favoriteFragrances.split(',').map(s=>s.trim()).filter(Boolean), favoriteNotes: form.favoriteNotes.split(',').map(s=>s.trim()).filter(Boolean), performance: form.performance }); setResult(d); }
    catch (e: any) { setError(e.message ?? 'Something went wrong.'); }
    finally { setLoading(false); }
  }
  if (result) return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="section-label mb-3">Your matches</p>
      <h1 className="font-display text-4xl text-bone">Here&rsquo;s what fits.</h1>
      <div className="mt-8 space-y-4">
        {result.matches?.map((m: any, i: number) => (
          <div key={m.fragranceId} className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3"><span className="font-mono text-2xs text-ash">#{i+1}</span><h3 className="font-display text-xl text-bone">{m.fragrance?.name}</h3></div>
                <p className="mt-0.5 text-sm text-ash">{(m.fragrance?.brands as any)?.name}</p>
                <p className="mt-3 text-sm leading-relaxed text-ash">{m.reasoning}</p>
              </div>
              <div className="text-right shrink-0"><p className="font-display text-3xl text-gold">{Math.round(m.matchScore)}%</p><p className="font-mono text-2xs text-ash">match</p></div>
            </div>
          </div>
        ))}
        {result.alternatives?.length > 0 && (
          <><h2 className="mt-8 font-display text-xl text-bone">Worth considering</h2>
          <div className="mt-4 space-y-3">{result.alternatives.map((a: any) => <div key={a.fragranceId} className="hairline rounded-xl p-4 text-sm"><span className="text-bone">{a.fragrance?.name}</span><span className="text-ash"> — {a.reasoning}</span></div>)}</div></>
        )}
      </div>
      <button onClick={() => { setResult(null); setStep(0); }} className="mt-10 font-mono text-2xs text-electric hover:underline">← Start over</button>
    </div>
  );
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="section-label mb-3">AI Fragrance Advisor</p>
      <h1 className="font-display text-4xl text-bone sm:text-5xl">Find your scent.</h1>
      <p className="mt-3 text-sm text-ash">Claude reads your preferences and recommends from a real catalog — never a hallucinated name.</p>
      <div className="mt-8 flex gap-2">{STEPS.map((s,i) => <div key={s} className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${i<=step?'bg-gold':'bg-bone/10'}`}/>)}</div>
      <p className="mt-2 font-mono text-2xs text-ash">{step+1} / {STEPS.length} — {STEPS[step]}</p>
      <div className="glass mt-6 rounded-2xl p-6 sm:p-8">
        {step === 0 && <div className="space-y-5">
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Age</span><input type="number" min={13} max={100} value={form.age} onChange={e=>upd('age',e.target.value)} className="input" placeholder="28"/></label>
          <label className="block"><span className="mb-2 block font-mono text-2xs uppercase tracking-wider text-ash">Gender preference</span><div className="grid grid-cols-2 gap-2">{['masculine','feminine','unisex','no-preference'].map(g=><button type="button" key={g} onClick={()=>upd('gender',g)} className={`rounded-xl border py-2.5 text-sm capitalize transition-colors ${form.gender===g?'border-gold/50 bg-gold/10 text-bone':'border-bone/10 text-ash'}`}>{g.replace('-',' ')}</button>)}</div></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Budget (USD)</span><input type="number" min={0} value={form.budgetUsd} onChange={e=>upd('budgetUsd',e.target.value)} className="input"/></label>
        </div>}
        {step === 1 && <div className="space-y-5">
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Country</span><input value={form.country} onChange={e=>upd('country',e.target.value)} className="input" placeholder="Bangladesh"/></label>
          <label className="block"><span className="mb-2 block font-mono text-2xs uppercase tracking-wider text-ash">Climate</span><div className="grid grid-cols-2 gap-2">{CLIMATES.map(({v,l})=><button type="button" key={v} onClick={()=>upd('climate',v)} className={`rounded-xl border py-3 text-sm transition-colors ${form.climate===v?'border-gold/50 bg-gold/10 text-bone':'border-bone/10 text-ash'}`}>{l}</button>)}</div></label>
        </div>}
        {step === 2 && <div className="space-y-5">
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Fragrances you love (comma separated)</span><input value={form.favoriteFragrances} onChange={e=>upd('favoriteFragrances',e.target.value)} className="input" placeholder="Bleu de Chanel, Aventus"/></label>
          <label className="block"><span className="mb-1.5 block font-mono text-2xs uppercase tracking-wider text-ash">Notes you like (comma separated)</span><input value={form.favoriteNotes} onChange={e=>upd('favoriteNotes',e.target.value)} className="input" placeholder="oud, bergamot, vanilla"/></label>
        </div>}
        {step === 3 && <div className="space-y-3"><p className="mb-3 text-sm text-ash">How much projection?</p>{PERF.map(({v,l,d})=><button type="button" key={v} onClick={()=>upd('performance',v)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-colors ${form.performance===v?'border-gold/50 bg-gold/10 text-bone':'border-bone/10 text-ash'}`}><span className="text-sm">{l}</span><span className="font-mono text-2xs opacity-60">{d}</span></button>)}</div>}
        {error && <p className="mt-4 text-sm text-ember">{error}</p>}
        <div className="mt-8 flex items-center justify-between">
          <button onClick={() => setStep(s => Math.max(0,s-1))} className={`text-sm text-ash hover:text-bone ${step===0?'invisible':''}`}>← Back</button>
          {step < STEPS.length-1 ? <button onClick={() => setStep(s => s+1)} className="btn-ghost">Continue →</button> : <button onClick={submit} disabled={loading} className="btn-gold disabled:opacity-50">{loading?'Finding matches…':'Reveal my matches'}</button>}
        </div>
      </div>
    </div>
  );
}
