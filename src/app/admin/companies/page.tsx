"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Company } from "@/types";
import { useRouter } from "next/navigation";

const COLOR_PRESETS = [
  { color: "blue",   primaryColor: "#2563EB", cls: "bg-blue-600",   label: "블루"   },
  { color: "sky",    primaryColor: "#0284C7", cls: "bg-sky-500",    label: "스카이" },
  { color: "green",  primaryColor: "#16A34A", cls: "bg-green-600",  label: "그린"   },
  { color: "purple", primaryColor: "#9333EA", cls: "bg-purple-600", label: "퍼플"   },
  { color: "orange", primaryColor: "#EA580C", cls: "bg-orange-600", label: "오렌지" },
  { color: "red",    primaryColor: "#DC2626", cls: "bg-red-600",    label: "레드"   },
];

type CompanyForm = Omit<Company, "id" | "_count">;

const EMPTY_FORM: CompanyForm = {
  slug: "", name: "", description: "", phone: "", color: "blue", primaryColor: "#2563EB",
};

function toSlug(name: string) {
  const map: Record<string, string> = {
    하나: "hana", 스카이: "sky", 제주: "jeju", 드라이브: "drive",
    렌터카: "rentcar", 렌트: "rent", 카: "car",
  };
  let slug = name.toLowerCase();
  Object.entries(map).forEach(([k, v]) => { slug = slug.replace(k, v); });
  return slug.replace(/[^a-z0-9-]/g, "").slice(0, 20) || "company";
}

function validate(form: CompanyForm): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "업체명을 입력해주세요.";
  if (!form.slug.trim()) errors.slug = "슬러그를 입력해주세요.";
  else if (!/^[a-z0-9-]+$/.test(form.slug)) errors.slug = "영문 소문자, 숫자, 하이픈만 사용 가능합니다.";
  if (!form.phone.trim()) errors.phone = "대표 전화를 입력해주세요.";
  return errors;
}

export default function CompaniesPage() {
  const { user } = useAdminAuth();
  const router = useRouter();

  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<CompanyForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (user?.role !== "super") { router.replace("/admin"); return; }
    fetch("/api/companies")
      .then((r) => r.json())
      .then(setCompanyList)
      .finally(() => setLoading(false));
  }, [user, router]);

  if (user?.role !== "super") return null;

  const colorMap = Object.fromEntries(COLOR_PRESETS.map((c) => [c.color, c]));

  const openAdd = () => {
    setEditingCompany(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setSlugManuallyEdited(false);
    setModalOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditingCompany(company);
    setForm({ slug: company.slug, name: company.name, description: company.description, phone: company.phone, color: company.color, primaryColor: company.primaryColor });
    setErrors({});
    setSlugManuallyEdited(true);
    setModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({ ...prev, name, slug: slugManuallyEdited ? prev.slug : toSlug(name) }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true);
    setForm((prev) => ({ ...prev, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "") }));
  };

  const handleColorSelect = (preset: typeof COLOR_PRESETS[number]) => {
    setForm((prev) => ({ ...prev, color: preset.color, primaryColor: preset.primaryColor }));
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      if (editingCompany) {
        const res = await fetch(`/api/companies/${editingCompany.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const err = await res.json();
          setErrors({ slug: err.error ?? "저장 실패" });
          return;
        }
        const updated = await res.json();
        setCompanyList((prev) => prev.map((c) => c.id === editingCompany.id ? { ...updated, _count: c._count } : c));
      } else {
        const res = await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const err = await res.json();
          setErrors({ slug: err.error ?? "저장 실패" });
          return;
        }
        const created = await res.json();
        setCompanyList((prev) => [...prev, { ...created, _count: { cars: 0, bookings: 0 } }]);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/companies/${id}`, { method: "DELETE" });
    setCompanyList((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
  };

  const deleteTarget = companyList.find((c) => c.id === deleteId);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">업체 관리</h1>
          <p className="text-gray-500 text-sm mt-1">총 {companyList.length}개 업체</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          업체 등록
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {companyList.map((company) => {
          const preset = colorMap[company.color];
          const count = company._count ?? { cars: 0, bookings: 0 };
          return (
            <div key={company.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0"
                    style={{ backgroundColor: company.primaryColor }}
                  >
                    {company.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{company.name}</h3>
                    <code className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">/{company.slug}</code>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(company)} className="text-blue-600 text-xs font-medium px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">수정</button>
                  <button onClick={() => setDeleteId(company.id)} className="text-red-500 text-xs font-medium px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">삭제</button>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{company.description}</p>

              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-gray-400">보유 차량</p>
                  <p className="font-bold text-gray-900">{count.cars}대</p>
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-gray-400">총 예약</p>
                  <p className="font-bold text-gray-900">{count.bookings}건</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {company.phone}
                </div>
                <a
                  href={`/${company.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium flex items-center gap-1 hover:opacity-70 transition-opacity"
                  style={{ color: company.primaryColor }}
                >
                  사이트 보기
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* 등록/수정 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900 text-lg">{editingCompany ? "업체 수정" : "업체 등록"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">업체명 <span className="text-red-500">*</span></label>
                <input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="예: 하나렌터카"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">슬러그 (URL) <span className="text-red-500">*</span></label>
                <div className={`flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 ${errors.slug ? "border-red-400" : "border-gray-200"}`}>
                  <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">/</span>
                  <input
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="hana"
                    className="flex-1 px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                {errors.slug
                  ? <p className="text-xs text-red-500 mt-1">{errors.slug}</p>
                  : <p className="text-xs text-gray-400 mt-1">서비스 URL: /{form.slug || "…"} — 영문 소문자, 숫자, 하이픈만 가능</p>
                }
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">소개</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="업체 소개를 입력해주세요"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">대표 전화 <span className="text-red-500">*</span></label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="1588-0000"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">브랜드 색상</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => handleColorSelect(preset)}
                      title={preset.label}
                      className={`w-9 h-9 rounded-full transition-transform ${preset.cls} ${form.color === preset.color ? "scale-125 ring-2 ring-offset-2 ring-gray-400" : "hover:scale-110"}`}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: form.primaryColor }}
                  >
                    {form.name?.[0] ?? "A"}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{form.name || "업체명"}</span>
                  <span className="text-xs text-gray-400 ml-auto">{form.primaryColor}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
              <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">취소</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                {saving ? "저장 중…" : editingCompany ? "수정 완료" : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg text-center mb-1">업체 삭제</h3>
            <p className="text-gray-500 text-sm text-center mb-1"><strong>{deleteTarget?.name}</strong>을(를) 삭제하시겠습니까?</p>
            <p className="text-red-500 text-xs text-center mb-6">⚠ 해당 업체의 차량 및 예약 데이터도 영향을 받습니다.</p>
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
