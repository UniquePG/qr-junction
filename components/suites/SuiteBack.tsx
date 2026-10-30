"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type BackHandler = () => void;

const SuiteBackContext = createContext<{
  active: boolean;
  run: () => void;
  setHandler: (handler: BackHandler | null) => void;
} | null>(null);

export function SuiteBackProvider({ children }: { children: React.ReactNode }) {
  const handlerRef = useRef<BackHandler | null>(null);
  const [active, setActive] = useState(false);

  const setHandler = useCallback((handler: BackHandler | null) => {
    handlerRef.current = handler;
    setActive(Boolean(handler));
  }, []);

  const run = useCallback(() => {
    handlerRef.current?.();
  }, []);

  const value = useMemo(() => ({ active, run, setHandler }), [active, run, setHandler]);

  return (
    <SuiteBackContext.Provider value={value}>
      {children}
    </SuiteBackContext.Provider>
  );
}

export function useSuiteBack(handler: BackHandler | null) {
  const setHandler = useContext(SuiteBackContext)?.setHandler;

  useEffect(() => {
    if (!setHandler) return;
    setHandler(handler);
    return () => setHandler(null);
  }, [setHandler, handler]);
}

export function useSuiteBackAction() {
  return useContext(SuiteBackContext);
}
