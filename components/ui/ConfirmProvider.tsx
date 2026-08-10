'use client';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

type ConfirmOpts = { title?: string; message: string; confirmLabel?: string; danger?: boolean };
type PromptOpts = { title?: string; message: string; placeholder?: string; defaultValue?: string; confirmLabel?: string };

type Ctx = {
  confirm: (opts: ConfirmOpts | string) => Promise<boolean>;
  prompt: (opts: PromptOpts | string) => Promise<string | null>;
};

const DialogContext = createContext<Ctx>({ confirm: async () => false, prompt: async () => null });
export const useConfirm = () => useContext(DialogContext).confirm;
export const usePrompt = () => useContext(DialogContext).prompt;

type Mode = { type: 'confirm'; opts: ConfirmOpts } | { type: 'prompt'; opts: PromptOpts } | null;

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(null);
  const [inputValue, setInputValue] = useState('');
  const resolver = useRef<(v: any) => void>();

  const confirm = useCallback((opts: ConfirmOpts | string) => {
    const o = typeof opts === 'string' ? { message: opts } : opts;
    setMode({ type: 'confirm', opts: o });
    return new Promise<boolean>(resolve => { resolver.current = resolve; });
  }, []);

  const prompt = useCallback((opts: PromptOpts | string) => {
    const o = typeof opts === 'string' ? { message: opts } : opts;
    setInputValue(o.defaultValue ?? '');
    setMode({ type: 'prompt', opts: o });
    return new Promise<string | null>(resolve => { resolver.current = resolve; });
  }, []);

  function close(result: any) {
    resolver.current?.(result);
    setMode(null);
  }

  return (
    <DialogContext.Provider value={{ confirm, prompt }}>
      {children}
      {mode && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4" onClick={() => close(mode.type === 'confirm' ? false : null)}>
          <div className="glass w-full max-w-sm rounded-2xl p-6 shadow-glass animate-fade-up" onClick={e => e.stopPropagation()}>
            {mode.type === 'confirm' && mode.opts.danger && (
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-ember/15 text-ember"><AlertTriangle size={16} /></div>
            )}
            {mode.opts.title && <h3 className="font-display text-lg text-bone mb-1.5">{mode.opts.title}</h3>}
            <p className="text-sm text-ash leading-relaxed">{mode.opts.message}</p>

            {mode.type === 'prompt' && (
              <input
                autoFocus
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={mode.opts.placeholder}
                onKeyDown={e => { if (e.key === 'Enter') close(inputValue); if (e.key === 'Escape') close(null); }}
                className="input mt-4"
              />
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => close(mode.type === 'confirm' ? false : null)} className="rounded-full px-4 py-2 text-sm text-ash hover:text-bone">Cancel</button>
              {mode.type === 'confirm' ? (
                <button onClick={() => close(true)} className={mode.opts.danger ? 'rounded-full bg-ember/15 border border-ember/30 px-4 py-2 text-sm text-ember hover:bg-ember/25' : 'btn-gold !py-2'}>
                  {mode.opts.confirmLabel ?? 'Confirm'}
                </button>
              ) : (
                <button onClick={() => close(inputValue)} className="btn-gold !py-2">{mode.opts.confirmLabel ?? 'Submit'}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
