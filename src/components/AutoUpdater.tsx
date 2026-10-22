import React, { useEffect, useState } from 'react';

export const AutoUpdater: React.FC = () => {
  const [initialVersion, setInitialVersion] = useState<string | null>(null);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);
  const [secondsUntilReload, setSecondsUntilReload] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Check version from server
    const checkVersion = async () => {
      try {
        const res = await fetch(`/api/version?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (res.ok) {
          const data = await res.json();
          const currentServerVer = data.version;

          if (!isMounted) return;

          setInitialVersion((prev) => {
            if (!prev) {
              return currentServerVer;
            }
            if (currentServerVer && prev !== currentServerVer) {
              setHasNewUpdate(true);
            }
            return prev;
          });
        }
      } catch (err) {
        // Silently ignore network hiccup
      }
    };

    // Initial check
    checkVersion();

    // Periodic check every 12 seconds
    const intervalId = setInterval(checkVersion, 12000);

    // Also check whenever user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  // When update is detected, start countdown and reload
  useEffect(() => {
    if (!hasNewUpdate) return;

    setSecondsUntilReload(3);
    const countdown = setInterval(() => {
      setSecondsUntilReload((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdown);
          // Hard reload with cache bypass
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [hasNewUpdate]);

  if (!hasNewUpdate) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-bounce">
      <div className="p-3.5 rounded-2xl bg-emerald-700 text-white font-semibold shadow-2xl flex items-center justify-between gap-3 border border-emerald-500/60">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">⚡</span>
          <div className="text-xs">
            <p className="font-bold">Nova atualização detectada!</p>
            <p className="text-[11px] opacity-90">
              Aplicando melhorias automaticamente em {secondsUntilReload}s...
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 rounded-xl bg-black/80 text-emerald-300 text-xs font-bold hover:bg-black transition-colors shrink-0 cursor-pointer"
        >
          Atualizar Já
        </button>
      </div>
    </div>
  );
};
