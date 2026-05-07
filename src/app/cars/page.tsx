"use client";

import { useState, useMemo } from "react";
import { cars, companies } from "@/data/cars";
import { Car } from "@/types";
import CarCard from "@/components/cars/CarCard";

const categories: { value: Car["category"] | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "economy", label: "경형" },
  { value: "compact", label: "준중형/중형" },
  { value: "suv", label: "SUV" },
  { value: "luxury", label: "럭셔리" },
  { value: "van", label: "미니밴" },
];

const fuelTypes: { value: Car["fuelType"] | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "gasoline", label: "가솔린" },
  { value: "diesel", label: "디젤" },
  { value: "electric", label: "전기" },
  { value: "hybrid", label: "하이브리드" },
];

export default function CarsPage() {
  const [companyId, setCompanyId] = useState<string>("all");
  const [category, setCategory] = useState<Car["category"] | "all">("all");
  const [fuelType, setFuelType] = useState<Car["fuelType"] | "all">("all");
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "name">("price_asc");

  const filtered = useMemo(() => {
    return cars
      .filter((car) => {
        if (companyId !== "all" && car.companyId !== companyId) return false;
        if (category !== "all" && car.category !== category) return false;
        if (fuelType !== "all" && car.fuelType !== fuelType) return false;
        if (car.pricePerDay > maxPrice) return false;
        if (onlyAvailable && !car.available) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.pricePerDay - b.pricePerDay;
        if (sortBy === "price_desc") return b.pricePerDay - a.pricePerDay;
        return a.name.localeCompare(b.name);
      });
  }, [companyId, category, fuelType, maxPrice, onlyAvailable, sortBy]);

  const companyMap = useMemo(
    () => Object.fromEntries(companies.map((c) => [c.id, c])),
    []
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-extrabold text-gray-900">차량 둘러보기</h1>
          <p className="text-gray-500 mt-1">총 {filtered.length}대의 차량이 있습니다</p>

          {/* 업체 필터 탭 */}
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setCompanyId("all")}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                companyId === "all"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              전체 업체
            </button>
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => setCompanyId(company.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  companyId === company.id
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {company.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 필터 사이드바 */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">차종</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        category === cat.value
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">연료</h3>
                <div className="flex flex-wrap gap-2">
                  {fuelTypes.map((ft) => (
                    <button
                      key={ft.value}
                      onClick={() => setFuelType(ft.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        fuelType === ft.value
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {ft.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">
                  최대 일일 요금:{" "}
                  <span className="text-blue-600">{maxPrice.toLocaleString()}원</span>
                </h3>
                <input
                  type="range"
                  min={30000}
                  max={200000}
                  step={5000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>3만원</span>
                  <span>20만원</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <label htmlFor="available" className="text-sm font-medium text-gray-700 cursor-pointer">
                  예약 가능한 차량만
                </label>
              </div>
            </div>

            {/* 선택된 업체 정보 */}
            {companyId !== "all" && companyMap[companyId] && (
              <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{companyMap[companyId].name}</h3>
                <p className="text-sm text-gray-500 mb-3">{companyMap[companyId].description}</p>
                <p className="text-sm font-semibold text-blue-600">{companyMap[companyId].phone}</p>
              </div>
            )}
          </aside>

          {/* 차량 목록 */}
          <div className="flex-1">
            <div className="flex justify-end mb-5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="price_asc">가격 낮은 순</option>
                <option value="price_desc">가격 높은 순</option>
                <option value="name">이름 순</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">조건에 맞는 차량이 없습니다</p>
                <p className="text-sm mt-1">필터를 조정해보세요</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((car) => (
                  <CarCard key={car.id} car={car} company={companyMap[car.companyId]} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
