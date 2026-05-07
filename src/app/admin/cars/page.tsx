"use client";

import { useState, useEffect, useRef } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Car, Company, CarCategory, Transmission, FuelType, PricingRule, Location } from "@/types";

const categoryLabel: Record<CarCategory, string> = {
  ECONOMY: "경형", COMPACT: "준중형/중형", SUV: "SUV", LUXURY: "럭셔리", VAN: "미니밴",
};
const fuelLabel: Record<FuelType, string> = {
  GASOLINE: "가솔린", DIESEL: "디젤", ELECTRIC: "전기", HYBRID: "하이브리드",
};

type CarForm = Omit<Car, "id" | "company" | "location" | "pricingRules">;

const EMPTY_FORM: CarForm = {
  companyId: "", name: "", brand: "", category: "COMPACT", year: 2024,
  seats: 5, transmission: "AUTO", fuelType: "GASOLINE", pricePerDay: 60000,
  weekendPrice: null, holidayPrice: null,
  features: [], description: "", imageUrl: null, images: [], locationId: null, available: true,
};

// ── 다중 이미지 업로드 컴포넌트 ──────────────────────────────────
function MultiImageUpload({ values, onChange }: { values: string[]; onChange: (urls: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "업로드 실패"); return null; }
    return data.url as string;
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    setError("");
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) urls.push(url);
    }
    if (urls.length) onChange([...values, ...urls]);
    setUploading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const remove = (idx: number) => onChange(values.filter((_, i) => i !== idx));

  const move = (from: number, to: number) => {
    const next = [...values];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">차량 사진 <span className="text-gray-400 text-xs font-normal">(첫번째 사진이 대표 이미지)</span></label>
        <span className="text-xs text-gray-400">{values.length}장</span>
      </div>

      {/* 업로드된 사진 그리드 */}
      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {values.map((url, idx) => (
            <div key={url + idx} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-100">
              <img src={url} alt={`사진 ${idx + 1}`} className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">대표</span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {idx > 0 && (
                  <button type="button" onClick={() => move(idx, idx - 1)}
                    className="bg-white/90 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-white">
                    ←
                  </button>
                )}
                <button type="button" onClick={() => remove(idx)}
                  className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
                  ✕
                </button>
                {idx < values.length - 1 && (
                  <button type="button" onClick={() => move(idx, idx + 1)}
                    className="bg-white/90 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-white">
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 추가 업로드 버튼 */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 transition-colors flex items-center justify-center gap-2 py-4"
      >
        {uploading ? (
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-sm text-gray-400">사진 추가 (여러 장 선택 가능)</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── 요금 규칙 관리 컴포넌트 ──────────────────────────────────────
function PricingRulesPanel({ carId }: { carId: string }) {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ startDate: "", endDate: "", price: "", label: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/cars/${carId}/pricing`)
      .then((r) => r.json())
      .then((data) => setRules(data))
      .finally(() => setLoading(false));
  }, [carId]);

  const handleAdd = async () => {
    if (!form.startDate || !form.endDate || !form.price) return;
    setAdding(true);
    const res = await fetch(`/api/cars/${carId}/pricing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price) }),
    });
    const created = await res.json();
    setRules((prev) => [...prev, created].sort((a, b) => a.startDate.localeCompare(b.startDate)));
    setForm({ startDate: "", endDate: "", price: "", label: "" });
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/pricing/${id}`, { method: "DELETE" });
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const formatDate = (iso: string) => iso?.slice(0, 10) ?? "-";

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* 등록된 규칙 목록 */}
      {rules.length > 0 ? (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-gray-500 font-medium px-3 py-2">기간</th>
                <th className="text-left text-gray-500 font-medium px-3 py-2">요금</th>
                <th className="text-left text-gray-500 font-medium px-3 py-2">메모</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                    {formatDate(rule.startDate)} ~ {formatDate(rule.endDate)}
                  </td>
                  <td className="px-3 py-2 font-semibold text-blue-600">{Number(rule.price).toLocaleString()}원</td>
                  <td className="px-3 py-2 text-gray-400 text-xs">{rule.label || "-"}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">등록된 특정 기간 요금이 없습니다.</p>
      )}

      {/* 새 규칙 추가 */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">새 기간 요금 추가</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">시작일</label>
            <input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">종료일</label>
            <input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">요금 (원)</label>
            <input type="number" step="1000" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              placeholder="80000"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">메모 (선택)</label>
            <input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              placeholder="추석 연휴 등"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={!form.startDate || !form.endDate || !form.price || adding}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          {adding ? "추가 중…" : "추가"}
        </button>
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────
export default function CarsAdminPage() {
  const { user } = useAdminAuth();
  const [carList, setCarList] = useState<Car[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [locationMap, setLocationMap] = useState<Record<string, Location[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"basic" | "pricing">("basic");
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [form, setForm] = useState<CarForm>(EMPTY_FORM);
  const [featuresInput, setFeaturesInput] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const myCompanyId = user?.role === "company" ? user.companyId : null;

  useEffect(() => {
    const url = myCompanyId ? `/api/cars?companyId=${myCompanyId}` : "/api/cars";
    Promise.all([
      fetch(url).then((r) => r.json()),
      fetch("/api/companies").then((r) => r.json()),
    ]).then(async ([cars, comps]) => {
      setCarList(cars);
      setCompanies(comps);
      // 모든 업체의 지점 목록 미리 로드
      const locFetches = await Promise.all(
        (comps as Company[]).map((c) =>
          fetch(`/api/locations?companyId=${c.id}`).then((r) => r.json()).then((locs) => [c.id, locs] as [string, Location[]])
        )
      );
      setLocationMap(Object.fromEntries(locFetches));
    }).finally(() => setLoading(false));
  }, [myCompanyId]);

  const companyMap = Object.fromEntries(companies.map((c) => [c.id, c]));
  // 현재 폼의 업체에 해당하는 지점 목록
  const formLocations: Location[] = locationMap[form.companyId] ?? [];

  const openAdd = () => {
    setEditingCar(null);
    setForm({ ...EMPTY_FORM, companyId: myCompanyId ?? "" });
    setFeaturesInput("");
    setModalTab("basic");
    setModalOpen(true);
  };

  const openEdit = (car: Car) => {
    setEditingCar(car);
    const { company: _, location: _l, pricingRules: __, ...rest } = car;
    setForm(rest);
    setFeaturesInput(car.features.join(", "));
    setModalTab("basic");
    setModalOpen(true);
  };

  const handleSave = async () => {
    const features = featuresInput.split(",").map((f) => f.trim()).filter(Boolean);
    setSaving(true);
    try {
      const payload = {
        ...form,
        features,
        weekendPrice: form.weekendPrice || null,
        holidayPrice: form.holidayPrice || null,
        images: form.images,
      };
      if (editingCar) {
        const res = await fetch(`/api/cars/${editingCar.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const updated = await res.json();
        setCarList((prev) => prev.map((c) => c.id === editingCar.id ? updated : c));
      } else {
        const res = await fetch("/api/cars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        setCarList((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/cars/${id}`, { method: "DELETE" });
    setCarList((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
  };

  const toggleAvailable = async (car: Car) => {
    const res = await fetch(`/api/cars/${car.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !car.available }),
    });
    const updated = await res.json();
    setCarList((prev) => prev.map((c) => c.id === car.id ? updated : c));
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
          <h1 className="text-2xl font-extrabold text-gray-900">차량 관리</h1>
          <p className="text-gray-500 text-sm mt-1">총 {carList.length}대</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          차량 등록
        </button>
      </div>

      {/* 차량 목록 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-gray-500 font-medium px-4 py-3">차량</th>
                {user?.role === "super" && <th className="text-left text-gray-500 font-medium px-4 py-3">업체</th>}
                <th className="text-left text-gray-500 font-medium px-4 py-3">차종</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">요금</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">상태</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {carList.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {(car.images?.[0] ?? car.imageUrl) ? (
                        <img src={car.images?.[0] ?? car.imageUrl!} alt={car.name} className="w-12 h-8 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-3 text-gray-400" fill="currentColor" viewBox="0 0 100 50">
                            <path d="M10,35 L15,20 Q20,10 35,10 L65,10 Q75,10 82,18 L90,28 L92,35 Q92,40 87,40 L80,40 Q78,45 70,45 Q62,45 60,40 L40,40 Q38,45 30,45 Q22,45 20,40 L13,40 Q8,40 8,35 Z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{car.name}</p>
                        <p className="text-xs text-gray-400">
                          {car.brand} · {car.year}년
                          {car.location && <span className="ml-1 text-blue-500">· {car.location.name}</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  {user?.role === "super" && (
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {car.company?.name ?? companyMap[car.companyId]?.name}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{categoryLabel[car.category]}</span>
                    <span className="text-xs text-gray-400 ml-1">{car.seats}인승</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 text-sm">{car.pricePerDay.toLocaleString()}원</p>
                    {(car.weekendPrice || car.holidayPrice) && (
                      <p className="text-xs text-gray-400">
                        {car.weekendPrice ? `주말 ${car.weekendPrice.toLocaleString()}` : ""}
                        {car.weekendPrice && car.holidayPrice ? " · " : ""}
                        {car.holidayPrice ? `공휴일 ${car.holidayPrice.toLocaleString()}` : ""}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAvailable(car)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${car.available ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                    >
                      {car.available ? "예약가능" : "예약불가"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(car)} className="text-blue-600 text-xs font-medium px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">수정</button>
                      <button onClick={() => setDeleteId(car.id)} className="text-red-500 text-xs font-medium px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
              {carList.length === 0 && (
                <tr>
                  <td colSpan={user?.role === "super" ? 6 : 5} className="px-4 py-10 text-center text-gray-400 text-sm">
                    등록된 차량이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 등록/수정 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 pt-5 pb-0 flex-shrink-0">
              <h2 className="font-bold text-gray-900 text-lg">{editingCar ? "차량 수정" : "차량 등록"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 탭 */}
            <div className="flex gap-1 px-5 mt-4 flex-shrink-0">
              {(["basic", "pricing"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setModalTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${modalTab === tab ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {tab === "basic" ? "기본 정보" : "요금 설정"}
                </button>
              ))}
            </div>

            {/* 탭 컨텐츠 */}
            <div className="overflow-y-auto flex-1 px-5 pb-5 mt-4 space-y-4">
              {modalTab === "basic" ? (
                <>
                  {/* 다중 이미지 업로드 */}
                  <MultiImageUpload
                    values={form.images}
                    onChange={(urls) => setForm((p) => ({ ...p, images: urls }))}
                  />

                  {/* 업체 선택 (슈퍼만) */}
                  {user?.role === "super" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">업체 <span className="text-red-500">*</span></label>
                      <select value={form.companyId}
                        onChange={(e) => setForm({ ...form, companyId: e.target.value, locationId: null })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">업체 선택</option>
                        {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}

                  {/* 지점 배정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      배정 지점
                      <span className="ml-1 text-xs text-gray-400 font-normal">(미선택 시 모든 지점에서 예약 가능)</span>
                    </label>
                    <select value={form.locationId ?? ""}
                      onChange={(e) => setForm({ ...form, locationId: e.target.value || null })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">지점 미지정</option>
                      {formLocations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                    {form.companyId && formLocations.length === 0 && (
                      <p className="text-xs text-gray-400 mt-1">등록된 지점이 없습니다. 지점관리에서 먼저 지점을 추가하세요.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">브랜드</label>
                      <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="현대" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">차량명</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="아반떼 CN7" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">차종</label>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as CarCategory })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {Object.entries(categoryLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">연식</label>
                      <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">인승</label>
                      <input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">변속기</label>
                      <select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value as Transmission })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="AUTO">자동</option>
                        <option value="MANUAL">수동</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">연료</label>
                      <select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value as FuelType })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {Object.entries(fuelLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">편의사양 (쉼표로 구분)</label>
                    <input value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)}
                      placeholder="블루투스, 후방카메라, 네비게이션"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="available" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })}
                      className="w-4 h-4 accent-blue-600" />
                    <label htmlFor="available" className="text-sm font-medium text-gray-700">예약 가능</label>
                  </div>
                </>
              ) : (
                /* 요금 설정 탭 */
                <>
                  {/* 기본/주말/공휴일 요금 */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">기본 요금</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">평일 기본 요금 (원) <span className="text-red-500">*</span></label>
                        <input type="number" step="1000" value={form.pricePerDay}
                          onChange={(e) => setForm({ ...form, pricePerDay: Number(e.target.value) })}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            주말 요금 (토·일)
                            <span className="ml-1 text-gray-400">(미입력 시 평일 요금 적용)</span>
                          </label>
                          <input type="number" step="1000"
                            value={form.weekendPrice ?? ""}
                            onChange={(e) => setForm({ ...form, weekendPrice: e.target.value ? Number(e.target.value) : null })}
                            placeholder={`${form.pricePerDay.toLocaleString()}`}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            공휴일 요금
                            <span className="ml-1 text-gray-400">(미입력 시 평일 요금 적용)</span>
                          </label>
                          <input type="number" step="1000"
                            value={form.holidayPrice ?? ""}
                            onChange={(e) => setForm({ ...form, holidayPrice: e.target.value ? Number(e.target.value) : null })}
                            placeholder={`${form.pricePerDay.toLocaleString()}`}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                    </div>

                    {/* 요금 미리보기 */}
                    <div className="mt-3 p-3 bg-blue-50 rounded-xl text-xs space-y-1">
                      <p className="font-semibold text-blue-700 mb-1.5">요금 적용 기준 (우선순위 순)</p>
                      <div className="flex justify-between text-blue-600">
                        <span>① 특정 기간 요금 (아래 설정)</span>
                        <span>최우선 적용</span>
                      </div>
                      <div className="flex justify-between text-blue-600">
                        <span>② 공휴일 요금</span>
                        <span>{form.holidayPrice ? `${form.holidayPrice.toLocaleString()}원` : "평일 요금 적용"}</span>
                      </div>
                      <div className="flex justify-between text-blue-600">
                        <span>③ 주말 요금 (토·일)</span>
                        <span>{form.weekendPrice ? `${form.weekendPrice.toLocaleString()}원` : "평일 요금 적용"}</span>
                      </div>
                      <div className="flex justify-between text-blue-600">
                        <span>④ 평일 기본 요금</span>
                        <span>{form.pricePerDay.toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>

                  {/* 특정 기간 요금 */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">특정 기간 요금</h3>
                    {editingCar ? (
                      <PricingRulesPanel carId={editingCar.id} />
                    ) : (
                      <div className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-xl">
                        차량 등록 후 특정 기간 요금을 추가할 수 있습니다.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 하단 버튼 */}
            <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setModalOpen(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">취소</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">
                {saving ? "저장 중…" : editingCar ? "수정 완료" : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 text-lg mb-2">차량 삭제</h3>
            <p className="text-gray-500 text-sm mb-6">해당 차량을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
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
