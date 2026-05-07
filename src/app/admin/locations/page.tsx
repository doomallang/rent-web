"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Location, Company } from "@/types";

const EMPTY_FORM = { name: "", companyId: "", address: "", phone: "" };

export default function LocationsPage() {
  const { user } = useAdminAuth();
  const [locationList, setLocationList] = useState<Location[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const myCompanyId = user?.role === "company" ? user.companyId : null;

  useEffect(() => {
    const url = myCompanyId ? `/api/locations?companyId=${myCompanyId}` : "/api/locations";
    Promise.all([
      fetch(url).then((r) => r.json()),
      fetch("/api/companies").then((r) => r.json()),
    ]).then(([locs, comps]) => {
      setLocationList(locs);
      setCompanies(comps);
    }).finally(() => setLoading(false));
  }, [myCompanyId]);

  const companyMap = Object.fromEntries(companies.map((c) => [c.id, c]));

  const openAdd = () => {
    setEditingLoc(null);
    setForm({ ...EMPTY_FORM, companyId: myCompanyId ?? "" });
    setModalOpen(true);
  };

  const openEdit = (loc: Location) => {
    setEditingLoc(loc);
    setForm({ name: loc.name, companyId: loc.companyId, address: loc.address, phone: loc.phone });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingLoc) {
        const res = await fetch(`/api/locations/${editingLoc.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, address: form.address, phone: form.phone }),
        });
        const updated = await res.json();
        setLocationList((prev) => prev.map((l) => l.id === editingLoc.id ? updated : l));
      } else {
        const res = await fetch("/api/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const created = await res.json();
        setLocationList((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/locations/${id}`, { method: "DELETE" });
    setLocationList((prev) => prev.filter((l) => l.id !== id));
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">지점 관리</h1>
          <p className="text-gray-500 text-sm mt-1">총 {locationList.length}개 지점</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          지점 등록
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-gray-500 font-medium px-4 py-3">지점명</th>
                {user?.role === "super" && <th className="text-left text-gray-500 font-medium px-4 py-3">업체</th>}
                <th className="text-left text-gray-500 font-medium px-4 py-3">주소</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">전화번호</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {locationList.map((loc) => (
                <tr key={loc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{loc.name}</td>
                  {user?.role === "super" && (
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {loc.company?.name ?? companyMap[loc.companyId]?.name}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-500 text-xs">{loc.address}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{loc.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(loc)} className="text-blue-600 text-xs font-medium px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">수정</button>
                      <button onClick={() => setDeleteId(loc.id)} className="text-red-500 text-xs font-medium px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
              {locationList.length === 0 && (
                <tr>
                  <td colSpan={user?.role === "super" ? 5 : 4} className="px-4 py-10 text-center text-gray-400 text-sm">
                    등록된 지점이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">{editingLoc ? "지점 수정" : "지점 등록"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              {user?.role === "super" && !editingLoc && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">업체</label>
                  <select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">업체 선택</option>
                    {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">지점명</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="서울 강남점"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="서울 강남구 테헤란로 123"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="02-0000-0000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">취소</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                {saving ? "저장 중…" : editingLoc ? "수정 완료" : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 text-lg mb-2">지점 삭제</h3>
            <p className="text-gray-500 text-sm mb-6">해당 지점을 삭제하시겠습니까?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">취소</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
