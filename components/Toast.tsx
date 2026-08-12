'use client';
import { createContext, useCallback, useContext, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
type ToastType = 'success'|'error'|'info';
type Toast = { id: string; message: string; type: ToastType };
type Ctx = { toast: (message: string, type?: ToastType) => void };
const ToastContext = createContext<Ctx>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }, []);
  const ICONS = { success: CheckCircle, error: AlertCircle, info: Info };
  const COLORS = { success: 'border-electric/30 bg-electric/10 text-electric', error: 'border-ember/30 bg-ember/10 text-ember', info: 'border-gold/30 bg-gold/10 text-gold' };
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none sm:left-auto sm:w-80">
        {toasts.map(t => {
          const Icon = ICONS[t.type];
          return (
            <div key={t.id} className={`glass flex items-start gap-3 rounded-xl border p-4 shadow-glass animate-fade-up pointer-events-auto ${COLORS[t.type]}`}>
              <Icon size={16} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm text-bone">{t.message}</p>
              <button onClick={() => setToasts(t2 => t2.filter(x => x.id !== t.id))} className="shrink-0 text-ash hover:text-bone"><X size={14} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
