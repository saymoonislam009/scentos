'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'Recommend something for a humid summer office',
  'Compare Sauvage EDT vs Sauvage Elixir',
  'Build me a 5-bottle starter collection under $400',
  'Suggest a layering combo for a winter date night',
];

export default function ScentGptPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.sendScentGptMessage({ sessionId, message: text });
      setSessionId(res.sessionId);
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'assistant', content: `Couldn't reach ScentGPT: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-72px)] max-w-3xl flex-col px-6">
      <div className="flex-1 overflow-y-auto py-10">
        {messages.length === 0 && (
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric">ScentGPT</p>
            <h1 className="mt-3 font-display text-3xl text-bone">Ask me anything about fragrance.</h1>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="hairline rounded-xl p-4 text-left text-sm text-ash transition-colors hover:border-bone/30 hover:text-bone"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm ${
                m.role === 'user' ? 'ml-auto bg-gold/15 text-bone' : 'glass text-bone'
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && <div className="glass max-w-[85%] rounded-2xl px-5 py-3 text-sm text-ash">Thinking…</div>}
        </div>
        <div ref={endRef} />
      </div>

      <div className="border-t border-bone/10 py-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ScentGPT…"
            className="input"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-gold px-5 py-3 text-sm font-medium text-matte disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
