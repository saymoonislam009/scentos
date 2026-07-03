'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

type FormState = {
  age: string;
  gender: string;
  budgetUsd: string;
  country: string;
  climate: string;
  favoriteFragrances: string;
  favoriteNotes: string;
  performance: string;
};

const STEPS = ['You', 'Place', 'Taste', 'Performance'] as const;

const GENDERS = ['masculine', 'feminine', 'unisex', 'no-preference'];
const CLIMATES = [
  { value: 'hot-humid', label: 'Hot & humid' },
  { value: 'hot-dry', label: 'Hot & dry' },
  { value: 'temperate', label: 'Temperate' },
  { value: 'cold', label: 'Cold' },
];
const PERFORMANCE = [
  { value: 'intimate', label: 'Intimate — just for me' },
  { value: 'moderate', label: 'Moderate — arm\u2019s length' },
  { value: 'strong', label: 'Strong — fills the room' },
  { value: 'beast-mode', label: 'Beast mode' },
];

export default function AdvisorPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    age: '',
    gender: 'no-preference',
    budgetUsd: '100',
    country: '',
    climate: 'temperate',
    favoriteFragrances: '',
    favoriteNotes: '',
    performance: 'moderate',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdvice({
        age: Number(form.age),
        gender: form.gender,
        budgetUsd: Number(form.budgetUsd),
        country: form.country,
        climate: form.climate,
        favoriteFragrances: form.favoriteFragrances.split(',').map((s) => s.trim()).filter(Boolean),
        favoriteNotes: form.favoriteNotes.split(',').map((s) => s.trim()).filter(Boolean),
        performance: form.performance,
      });
      setResult(data);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong reaching the Advisor.');
    } finally {
      setLoading(false);
    }
  }

  if (result) return <AdvisorResults result={result} onRestart={() => setResult(null)} />;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">AI Fragrance Advisor</p>
      <h1 className="mt-3 font-display text-4xl text-bone">Let&rsquo;s find your scent.</h1>

      <div className="mt-8 flex gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-gold' : 'bg-bone/10'}`} />
        ))}
      </div>

      <div className="glass mt-8 rounded-2xl p-8">
        {step === 0 && (
          <div className="space-y-5">
            <Field label="Age">
              <input
                type="number"
                value={form.age}
                onChange={(e) => update('age', e.target.value)}
                className="input"
                placeholder="28"
              />
            </Field>
            <Field label="Preferred fragrance gender">
              <Select value={form.gender} onChange={(v) => update('gender', v)} options={GENDERS} />
            </Field>
            <Field label="Budget (USD, per bottle)">
              <input
                type="number"
                value={form.budgetUsd}
                onChange={(e) => update('budgetUsd', e.target.value)}
                className="input"
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <Field label="Country">
              <input
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
                className="input"
                placeholder="Bangladesh"
              />
            </Field>
            <Field label="Climate">
              <div className="grid grid-cols-2 gap-3">
                {CLIMATES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => update('climate', c.value)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                      form.climate === c.value ? 'border-gold bg-gold/10 text-bone' : 'border-bone/10 text-ash'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="Fragrances you already love (comma separated)">
              <input
                value={form.favoriteFragrances}
                onChange={(e) => update('favoriteFragrances', e.target.value)}
                className="input"
                placeholder="Bleu de Chanel, Aventus"
              />
            </Field>
            <Field label="Notes you're drawn to (comma separated)">
              <input
                value={form.favoriteNotes}
                onChange={(e) => update('favoriteNotes', e.target.value)}
                className="input"
                placeholder="oud, bergamot, vanilla"
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="mb-2 text-sm text-ash">How much projection do you want?</p>
            {PERFORMANCE.map((p) => (
              <button
                key={p.value}
                onClick={() => update('performance', p.value)}
                className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  form.performance === p.value ? 'border-gold bg-gold/10 text-bone' : 'border-bone/10 text-ash'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={`text-sm text-ash ${step === 0 ? 'invisible' : ''}`}
          >
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="rounded-full bg-bone/10 px-6 py-2.5 text-sm text-bone hover:bg-bone/15"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-matte disabled:opacity-50"
            >
              {loading ? 'Reading your taste…' : 'Reveal my matches'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wider text-ash">{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
      {options.map((o) => (
        <option key={o} value={o}>
          {o.replace('-', ' ')}
        </option>
      ))}
    </select>
  );
}

function AdvisorResults({ result, onRestart }: { result: any; onRestart: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Your matches</p>
      <h1 className="mt-3 font-display text-4xl text-bone">Here&rsquo;s what fits.</h1>

      <div className="mt-8 space-y-4">
        {result.matches?.map((m: any) => (
          <div key={m.fragranceId} className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl text-bone">
                  {m.fragrance?.name ?? 'Fragrance'}{' '}
                  <span className="text-ash">— {m.fragrance?.brand?.name}</span>
                </h3>
                <p className="mt-2 text-sm text-ash">{m.reasoning}</p>
              </div>
              <span className="font-mono text-2xl text-gold">{Math.round(m.matchScore)}%</span>
            </div>
          </div>
        ))}
      </div>

      {result.alternatives?.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-lg text-bone">Worth considering</h2>
          <div className="mt-4 space-y-3">
            {result.alternatives.map((a: any) => (
              <div key={a.fragranceId} className="hairline rounded-xl p-4 text-sm">
                <span className="text-bone">{a.fragrance?.name}</span>
                <span className="text-ash"> — {a.reasoning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onRestart} className="mt-10 text-sm text-electric">
        ← Start over
      </button>
    </div>
  );
}
