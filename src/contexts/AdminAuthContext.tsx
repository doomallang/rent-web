"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AdminRole = "super" | "company";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  companyId: string | null;
  companyName: string | null;
}

interface AdminAuthContextValue {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const DEMO_USERS: (Omit<AdminUser, "companyId"> & { password: string; companySlug: string | null })[] = [
  {
    id: "u0",
    name: "슈퍼관리자",
    email: "admin@driveon.kr",
    password: "admin1234",
    role: "super",
    companySlug: null,
    companyName: null,
  },
  {
    id: "u1",
    name: "하나렌터카 관리자",
    email: "admin@hana.kr",
    password: "hana1234",
    role: "company",
    companySlug: "hana",
    companyName: "하나렌터카",
  },
  {
    id: "u2",
    name: "스카이렌터카 관리자",
    email: "admin@sky.kr",
    password: "sky1234",
    role: "company",
    companySlug: "sky",
    companyName: "스카이렌터카",
  },
  {
    id: "u3",
    name: "제주드라이브 관리자",
    email: "admin@jeju.kr",
    password: "jeju1234",
    role: "company",
    companySlug: "jeju",
    companyName: "제주드라이브",
  },
];

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const STORAGE_KEY = "admin_user";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const match = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (!match) return false;

    let companyId: string | null = null;
    if (match.companySlug) {
      try {
        const res = await fetch(`/api/companies?slug=${match.companySlug}`);
        const companies = await res.json();
        companyId = companies[0]?.id ?? null;
      } catch {
        return false;
      }
    }

    const { password: _, companySlug: __, ...rest } = match;
    const adminUser: AdminUser = { ...rest, companyId };
    setUser(adminUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AdminAuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
