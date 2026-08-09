'use client';
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('scentos-install-dismissed')) { setDismissed(true); return; }
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); setTimeout(() => setShow(true), 3000); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null); setShow(false);
  }

  function dismiss() {
    setShow(false); setDismissed(true);
    localStorage.setItem('scentos-install-dismissed', '1');
  }

  if (!show || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[90] sm:left-auto sm:right-4 sm:w-80">
      <div className="glass flex items-start gap-3 rounded-2xl border border-gold/20 p-4 shadow-glass animate-fade-up">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold"><Download size={16} /></div>
        <div className="flex-1">
          <p className="text-sm font-medium text-bone">Install ScentOS</p>
          <p className="mt-0.5 text-xs text-ash">Add to your home screen for the full app experience.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={install} className="btn-gold !py-1.5 text-xs">Install</button>
            <button onClick={dismiss} className="text-xs text-ash hover:text-bone">Not now</button>
          </div>
        </div>
        <button onClick={dismiss} className="shrink-0 text-ash/50 hover:text-ash"><X size={14} /></button>
      </div>
    </div>
  );
}
