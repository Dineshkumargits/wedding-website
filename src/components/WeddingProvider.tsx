'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  WeddingConfig,
  getWeddingConfig,
  INVITATIONS,
  prakashBellaConfig,
} from '@/data/wedding';

interface WeddingContextValue {
  config: WeddingConfig;
  activeId: string;
  setInvitation: (id: string) => void;
  availableInvitations: Array<{ id: string; label: string }>;
}

const WeddingContext = createContext<WeddingContextValue>({
  config: prakashBellaConfig,
  activeId: 'prakash-bella',
  setInvitation: () => {},
  availableInvitations: [],
});

function resolveFromBrowser(fallback?: WeddingConfig): WeddingConfig {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get('invite') || params.get('wedding');
    if (querySlug) {
      return getWeddingConfig(querySlug);
    }
    const hostname = window.location.hostname;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return getWeddingConfig(hostname);
    }
  }
  return fallback ?? prakashBellaConfig;
}

export function WeddingProvider({
  children,
  initialConfig,
}: {
  children: React.ReactNode;
  initialConfig?: WeddingConfig;
}) {
  const [config, setConfig] = useState<WeddingConfig>(() => {
    return initialConfig ?? resolveFromBrowser(initialConfig);
  });
  const [activeId, setActiveId] = useState<string>(() => {
    return (initialConfig ?? resolveFromBrowser(initialConfig)).id ?? 'prakash-bella';
  });

  useEffect(() => {
    const resolved = resolveFromBrowser(initialConfig);
    setConfig(resolved);
    setActiveId(resolved.id ?? 'prakash-bella');

    const handleUrlChange = () => {
      const updated = resolveFromBrowser(initialConfig);
      setConfig(updated);
      setActiveId(updated.id ?? 'prakash-bella');
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [initialConfig]);

  const handleSetInvitation = (id: string) => {
    const resolved = INVITATIONS[id] || getWeddingConfig(id);
    setActiveId(resolved.id ?? id);
    setConfig(resolved);

    // Update query param in URL without page refresh
    const url = new URL(window.location.href);
    url.searchParams.set('invite', id);
    window.history.replaceState({}, '', url.toString());
  };

  const availableInvitations = [
    { id: 'prakash-bella', label: 'Prakashraj & Bella' },
    { id: 'sanjay-fathima', label: 'Sanjay & Fathima' },
  ];

  return (
    <WeddingContext.Provider
      value={{
        config,
        activeId,
        setInvitation: handleSetInvitation,
        availableInvitations,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
}

export function useWeddingConfig(): WeddingConfig {
  const ctx = useContext(WeddingContext);
  return ctx.config;
}

export function useWedding() {
  return useContext(WeddingContext);
}
