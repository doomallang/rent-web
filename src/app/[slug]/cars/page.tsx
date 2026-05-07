"use client";

import { useState, useMemo, useEffect } from "react";
import { use } from "react";
import { Car, Company, Location } from "@/types";
import CarCard from "@/components/cars/CarCard";
import DateRangePicker from "@/components/ui/DateRangePicker";
import CustomSelect from "@/components/ui/CustomSelect";

const categories: { value: Car["category"] | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "ECONOMY", label: "경형" },
  { value: "COMPACT", label: "준중형/중형" },
  { value: "SUV", label: "SUV" },
  { value: "LUXURY", label: "럭셔리" },
  { value: "VAN", label: "미니밴" },
];

const fuelTypes: { value: Car["fuelType"] | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "GASOLINE", label: "가솔린" },
  { value: "DIESEL", label: "디젤" },
  { value: "ELECTRIC", label: "전기" },
  { value: "HYBRID", label: "하이브리드" },
];

export default function CompanyCarsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyCars, setCompanyCars] = useState<Car[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  // 입력용 pending 상태 (검색 버튼 전까지는 API 미호출)
  const [pendingPickup, setPendingPickup] = useState(() =>
    typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("pickup") ?? "") : ""
  );
  const [pendingReturn, setPendingReturn] = useState(() =>
    typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("return") ?? "") : ""
  );

  // 실제 적용된 날짜 (useEffect 트리거)
  const [pickupDate, setPickupDate] = useState(() =>
    typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("pickup") ?? "") : ""
  );
  const [returnDate, setReturnDate] = useState(() =>
    typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("return") ?? "") : ""
  );

  const [category, setCategory] = useState<Car["category"] | "all">("all");
  const [fuelType, setFuelType] = useState<Car["fuelType"] | "all">("all");
  const [locationId, setLocationId] = useState<string | "all">("all");
  const [maxPrice, setMaxPrice] = useState(200000);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "name">("price_asc");

  const handleSearch = () => {
    setPickupDate(pendingPickup);
    setReturnDate(pendingReturn);
  };

  const handleReset = () => {
    setPendingPickup(""); setPendingReturn("");
    setPickupDate(""); setReturnDate("");
    setCategory("all"); setFuelType("all");
    setLocationId("all"); setMaxPrice(200000); setOnlyAvailable(false);
  };

  // 날짜가 적용될 때만 API 재조회
  useEffect(() => {
    setLoading(true);
    const carsUrl = new URL("/api/cars", window.location.origin);
    carsUrl.searchParams.set("slug", slug);
    if (pickupDate && returnDate) {
      carsUrl.searchParams.set("pickupDate", pickupDate);
      carsUrl.searchParams.set("returnDate", returnDate);
    }

    Promise.all([
      fetch(`/api/companies?slug=${slug}`).then((r) => r.json()),
      fetch(carsUrl.toString()).then((r) => r.json()),
    ]).then(async ([companies, cars]) => {
      const comp: Company | null = companies[0] ?? null;
      setCompany(comp);
      setCompanyCars(Array.isArray(cars) ? cars : []);
      if (comp) {
        const locs = await fetch(`/api/locations?companyId=${comp.id}`).then((r) => r.json());
        setLocations(Array.isArray(locs) ? locs : []);
      }
    }).finally(() => setLoading(false));
  }, [slug, pickupDate, returnDate]);

  // URL 파라미터에서 location 초기값 설정
  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const loc = p.get("location");
      if (loc) {
        const matched = locations.find((l) => l.name === loc);
        if (matched) setLocationId(matched.id);
      }
    }
  }, [locations]);

  const filtered = useMemo(() => {
    return companyCars
      .filter((car) => {
        if (category !== "all" && car.category !== category) return false;
        if (fuelType !== "all" && car.fuelType !== fuelType) return false;
        if (locationId !== "all") {
          if (car.locationId && car.locationId !== locationId) return false;
        }
        if (car.pricePerDay > maxPrice) return false;
        if (onlyAvailable && !car.available) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.pricePerDay - b.pricePerDay;
        if (sortBy === "price_desc") return b.pricePerDay - a.pricePerDay;
        return a.name.localeCompare(b.name);
      });
  }, [companyCars, category, fuelType, locationId, maxPrice, onlyAvailable, sortBy]);

  // 활성 필터 수 (날짜 적용 기준)
  const activeCount = [
    pickupDate && returnDate,
    category !== "all",
    fuelType !== "all",
    locationId !== "all",
    maxPrice < 200000,
    onlyAvailable,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">업체를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">차량 둘러보기</h1>
            <p className="text-gray-500 mt-1">총 {filtered.length}대의 차량이 있습니다</p>
          </div>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 10h12M9 16h6" />
            </svg>
            필터
            {activeCount > 0 && (
              <span
                className="text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                style={{ backgroundColor: company.primaryColor }}
              >
                {activeCount}
              </span>
            )}
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${sidebarOpen ? "rotate-90" : "-rotate-90"}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 필터 사이드바 */}
          {sidebarOpen && (
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* 사이드바 헤더 */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <span className="font-bold text-gray-900">검색 필터</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="닫기"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-5 space-y-6">
                  {/* 날짜 필터 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900">예약 날짜</h3>
                      {(pendingPickup || pendingReturn) && (
                        <button
                          onClick={() => { setPendingPickup(""); setPendingReturn(""); }}
                          className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          초기화
                        </button>
                      )}
                    </div>
                    <DateRangePicker
                      startDate={pendingPickup}
                      endDate={pendingReturn}
                      onChange={(s, e) => { setPendingPickup(s); setPendingReturn(e); }}
                      minDate={today}
                      primaryColor={company.primaryColor}
                    />
                  </div>

                  {/* 지점 필터 */}
                  {locations.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">지점</h3>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setLocationId("all")}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${locationId === "all" ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          style={locationId === "all" ? { backgroundColor: company.primaryColor } : {}}>
                          전체
                        </button>
                        {locations.map((loc) => (
                          <button key={loc.id} onClick={() => setLocationId(loc.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${locationId === loc.id ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            style={locationId === loc.id ? { backgroundColor: company.primaryColor } : {}}>
                            {loc.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 차종 */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">차종</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button key={cat.value} onClick={() => setCategory(cat.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${category === cat.value ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          style={category === cat.value ? { backgroundColor: company.primaryColor } : {}}>
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 연료 */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">연료</h3>
                    <div className="flex flex-wrap gap-2">
                      {fuelTypes.map((ft) => (
                        <button key={ft.value} onClick={() => setFuelType(ft.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${fuelType === ft.value ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          style={fuelType === ft.value ? { backgroundColor: company.primaryColor } : {}}>
                          {ft.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 가격 */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">
                      최대 일일 요금: <span style={{ color: company.primaryColor }}>{maxPrice.toLocaleString()}원</span>
                    </h3>
                    <input type="range" min={30000} max={200000} step={5000} value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full" />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>3만원</span><span>20만원</span>
                    </div>
                  </div>

                  {/* 예약 가능 */}
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="available" checked={onlyAvailable}
                      onChange={(e) => setOnlyAvailable(e.target.checked)} className="w-4 h-4" />
                    <label htmlFor="available" className="text-sm font-medium text-gray-700 cursor-pointer">예약 가능한 차량만</label>
                  </div>

                  {/* 검색 버튼 */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={handleSearch}
                      className="w-full py-3 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90"
                      style={{ backgroundColor: company.primaryColor }}
                    >
                      검색하기
                    </button>
                    {activeCount > 0 && (
                      <button
                        onClick={handleReset}
                        className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        필터 초기화
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* 차량 목록 */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-end mb-5">
              <CustomSelect
                value={sortBy}
                onChange={(v) => setSortBy(v as typeof sortBy)}
                options={[
                  { value: "price_asc", label: "가격 낮은 순" },
                  { value: "price_desc", label: "가격 높은 순" },
                  { value: "name", label: "이름 순" },
                ]}
                primaryColor={company.primaryColor}
                className="w-36"
              />
            </div>

            {/* 적용된 날짜 표시 */}
            {pickupDate && returnDate && (
              <div
                className="mb-4 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between"
                style={{ backgroundColor: `${company.primaryColor}15`, color: company.primaryColor }}
              >
                <span>{pickupDate} ~ {returnDate} 예약 가능 차량</span>
                <button
                  onClick={() => { setPendingPickup(""); setPendingReturn(""); setPickupDate(""); setReturnDate(""); }}
                  className="ml-3 opacity-60 hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="font-medium">조건에 맞는 차량이 없습니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((car) => (
                  <CarCard key={car.id} car={car} company={company} slug={slug} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
