'use client';
import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
type Msg = { role: 'user' | 'assistant'; content: string };
const SUGG = ['Compare Sauvage EDT vs EDP','Best fragrance for hot humid weather under $100','Build me a 5-bottle capsule wardrobe','What should I layer with Aventus?'];
export default function ScentGptPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  async function send(text: string) {
    if (!text.trim() || loading) return;
    setMessages(m => [...m, { role: 'user', content: text }]); setInput(''); setLoading(true);
    try { const res = await api.sendScentGptMessage({ sessionId, message: text }); setSessionId(res.sessionId); setMessages(m => [...m, { role: 'assistant', content: res.reply }]); }
    catch (e: any) { setMessages(m => [...m, { role: 'assistant', content: `Error: ${e.message}` }]); }
    finally { setLoading(false); }
  }
  return (
    <div className="mx-auto flex h-[calc(100dvh-72px)] max-w-3xl flex-col px-4 sm:px-6">
      <div className="flex items-center gap-3 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15"><Sparkles size={16} className="text-gold" /></div>
        <div><h1 className="font-display text-xl text-bone">ScentGPT</h1><p className="font-mono text-2xs text-ash">Looks up real catalog data before answering</p></div>
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <div className="py-8">
            <p className="text-center text-sm text-ash">Ask me anything about fragrance.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {SUGG.map(s => <button key={s} onClick={() => send(s)} className="hairline rounded-xl p-4 text-left text-sm text-ash hover:border-bone/20 hover:text-bone transition-all">{s}</button>)}
            </div>
          </div>
        )}
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-gold/15 border border-gold/20 text-bone' : 'glass text-bone'}`}>{m.content}</div>
            </div>
          ))}
          {loading && <div className="flex justify-start"><div className="glass max-w-[85%] rounded-2xl px-4 py-3"><div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-gold/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</div></div></div>}
        </div>
        <div ref={endRef} />
      </div>
      <div className="border-t border-bone/[0.06] py-4">
        <div className="flex gap-3 items-end">
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="Ask ScentGPT… (Enter to send)" rows={1} className="input flex-1 resize-none" />
          <button onClick={() => send(input)} disabled={loading || !input.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-matte transition-opacity disabled:opacity-40"><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
}
