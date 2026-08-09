'use client';
import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';

function af(path: string, secret: string, init: RequestInit = {}): Promise<any> {
  return fetch(path, { ...init, headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret, ...(init.headers as any || {}) } }).then(r => r.json());
}

export function NotesAccordsEditor({ fragranceId, secret, onClose }: { fragranceId: string; secret: string; onClose: () => void }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [accords, setAccords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteForm, setNoteForm] = useState({ name: '', position: 'top' });
  const [accordForm, setAccordForm] = useState({ name: '', strength: '0.8' });

  function refresh() {
    setLoading(true);
    Promise.all([
      af(`/api/admin/fragrances/${fragranceId}/notes`, secret),
      af(`/api/admin/fragrances/${fragranceId}/accords`, secret),
    ]).then(([n, a]) => { setNotes(Array.isArray(n) ? n : []); setAccords(Array.isArray(a) ? a : []); setLoading(false); });
  }
  useEffect(refresh, [fragranceId, secret]);

  async function addNote(e: React.FormEvent) {
    e.preventDefault(); if (!noteForm.name.trim()) return;
    await af(`/api/admin/fragrances/${fragranceId}/notes`, secret, { method: 'POST', body: JSON.stringify({ noteName: noteForm.name.trim(), position: noteForm.position }) });
    setNoteForm({ name: '', position: noteForm.position }); refresh();
  }
  async function removeNote(noteId: string) {
    await af(`/api/admin/fragrances/${fragranceId}/notes`, secret, { method: 'DELETE', body: JSON.stringify({ noteId }) });
    refresh();
  }
  async function addAccord(e: React.FormEvent) {
    e.preventDefault(); if (!accordForm.name.trim()) return;
    await af(`/api/admin/fragrances/${fragranceId}/accords`, secret, { method: 'POST', body: JSON.stringify({ accordName: accordForm.name.trim(), strength: Number(accordForm.strength) }) });
    setAccordForm({ name: '', strength: '0.8' }); refresh();
  }
  async function removeAccord(accordId: string) {
    await af(`/api/admin/fragrances/${fragranceId}/accords`, secret, { method: 'DELETE', body: JSON.stringify({ accordId }) });
    refresh();
  }

  const grouped = { top: notes.filter(n => n.position === 'top'), mid: notes.filter(n => n.position === 'mid'), base: notes.filter(n => n.position === 'base' || n.position === 'bottom') };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-10">
      <div className="glass w-full max-w-2xl rounded-2xl p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl text-bone">Notes & Accords</h2>
          <button onClick={onClose} className="text-ash hover:text-bone"><X size={18} /></button>
        </div>

        {loading ? <div className="h-40 animate-pulse rounded-xl bg-obsidian2" /> : (
          <>
            <div className="mb-8">
              <h3 className="mb-3 font-mono text-2xs uppercase tracking-wider text-ash">Notes</h3>
              <form onSubmit={addNote} className="mb-4 flex gap-2">
                <input value={noteForm.name} onChange={e => setNoteForm(f => ({ ...f, name: e.target.value }))} placeholder="Note name (e.g. Bergamot)" className="input flex-1" />
                <select value={noteForm.position} onChange={e => setNoteForm(f => ({ ...f, position: e.target.value }))} className="input w-28">
                  <option value="top">Top</option><option value="mid">Mid</option><option value="base">Base</option>
                </select>
                <button type="submit" className="btn-gold shrink-0 !px-3"><Plus size={14} /></button>
              </form>
              <div className="space-y-2">
                {(['top', 'mid', 'base'] as const).map(pos => grouped[pos].length > 0 && (
                  <div key={pos} className="flex flex-wrap items-center gap-1.5">
                    <span className="w-10 font-mono text-2xs uppercase text-ash">{pos}</span>
                    {grouped[pos].map((n: any) => (
                      <span key={n.notes.id} className="note-pill flex items-center gap-1.5">
                        {n.notes.name}
                        <button onClick={() => removeNote(n.notes.id)} className="text-ash/50 hover:text-ember"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                ))}
                {notes.length === 0 && <p className="text-sm text-ash">No notes yet.</p>}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-mono text-2xs uppercase tracking-wider text-ash">Accords</h3>
              <form onSubmit={addAccord} className="mb-4 flex gap-2">
                <input value={accordForm.name} onChange={e => setAccordForm(f => ({ ...f, name: e.target.value }))} placeholder="Accord name (e.g. Woody)" className="input flex-1" />
                <input type="number" min={0} max={1} step={0.05} value={accordForm.strength} onChange={e => setAccordForm(f => ({ ...f, strength: e.target.value }))} className="input w-20" />
                <button type="submit" className="btn-gold shrink-0 !px-3"><Plus size={14} /></button>
              </form>
              <div className="space-y-2">
                {accords.map((a: any) => (
                  <div key={a.accords.id} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm text-bone">{a.accords.name}</span>
                    <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-bone/[0.06]"><div className="accord-bar h-full rounded-full" style={{ width: `${a.strength * 100}%` }} /></div>
                    <span className="w-10 shrink-0 text-right font-mono text-2xs text-ash">{Math.round(a.strength * 100)}%</span>
                    <button onClick={() => removeAccord(a.accords.id)} className="shrink-0 text-ash/50 hover:text-ember"><X size={12} /></button>
                  </div>
                ))}
                {accords.length === 0 && <p className="text-sm text-ash">No accords yet.</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
