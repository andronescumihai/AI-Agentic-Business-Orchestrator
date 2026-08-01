"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ActiveUser } from "@/lib/types";

interface RoleContextValue {
  user: ActiveUser | null;
  setUser: (user: ActiveUser | null) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);
const STORAGE_KEY = "clinic-ai-active-user";

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): string | null {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

function parseUser(raw: string | null): ActiveUser | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActiveUser;
  } catch {
    return null;
  }
}

/**
 * "Autentificarea" e simulată prin localStorage. useSyncExternalStore
 * citește acest store extern în siguranță la hidratare (server vede
 * mereu null, clientul preia valoarea reală imediat după mount, fără
 * setState manual într-un efect).
 */
export function RoleProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const user = parseUser(raw);

  function setUser(next: ActiveUser | null) {
    if (next) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    listeners.forEach((listener) => listener());
  }

  return (
    <RoleContext.Provider value={{ user, setUser }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole trebuie folosit în interiorul RoleProvider");
  return ctx;
}
