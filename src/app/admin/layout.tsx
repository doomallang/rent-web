"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import Sidebar from "@/components/admin/Sidebar";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAdminAuth();

  useEffect(() => {
    if (pathname !== "/admin/login" && !user) {
      const stored = localStorage.getItem("admin_user");
      if (!stored) router.replace("/admin/login");
    }
  }, [pathname, user, router]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* 데스크탑 사이드바 */}
      <aside className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </aside>

      {/* 모바일 오버레이 사이드바 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 모바일 헤더 */}
        <header className="lg:hidden flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-gray-900">드라이브온 관리자</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}
