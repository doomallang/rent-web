"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Company, Location } from "@/types";
import DateRangePicker from "@/components/ui/DateRangePicker";
import CustomSelect from "@/components/ui/CustomSelect";

function displayDate(ds: string) {
  if (!ds) return null;
  const [, m, d] = ds.split("-");
  return `${+m}월 ${+d}일`;
}

export default function CompanyHero({ company }: { company: Company }) {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch(`/api/locations?companyId=${company.id}`)
      .then((r) => r.json())
      .then((data) => setLocations(Array.isArray(data) ? data : []));
  }, [company.id]);

  // Close calendar on outside click
  useEffect(() => {
    if (!calOpen) return;
    const handle = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setCalOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [calOpen]);

  // Auto-close when range is complete
  useEffect(() => {
    if (pickupDate && returnDate) setCalOpen(false);
  }, [pickupDate, returnDate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickupLocation) params.set("location", pickupLocation);
    if (pickupDate) params.set("pickup", pickupDate);
    if (returnDate) params.set("return", returnDate);
    router.push(`/${company.slug}/cars?${params.toString()}`);
  };

  const dateLabel = (() => {
    if (pickupDate && returnDate) return `${displayDate(pickupDate)} → ${displayDate(returnDate)}`;
    if (pickupDate) return `${displayDate(pickupDate)} → 반납일 선택`;
    return null;
  })();

  return (
    <section
      className="relative text-white overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${company.primaryColor}dd, ${company.primaryColor})` }}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            {company.name}과 함께
            <br />
            드라이브하세요
          </h1>
          <p className="text-lg md:text-xl opacity-80 max-w-xl mx-auto">
            {company.description}
          </p>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-5 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 픽업 장소 */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">픽업 장소</label>
              {locations.length > 0 ? (
                <CustomSelect
                  value={pickupLocation}
                  onChange={setPickupLocation}
                  options={locations.map((loc) => ({ value: loc.name, label: loc.name }))}
                  placeholder="지점을 선택하세요"
                  primaryColor={company.primaryColor}
                />
              ) : (
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="픽업 장소 입력"
                  className="border border-gray-200 rounded-xl px-3 py-3 text-gray-800 focus:outline-none focus:ring-2 bg-gray-50 text-sm"
                />
              )}
            </div>

            {/* 날짜 선택 (드롭다운 달력) */}
            <div className="flex flex-col gap-1" ref={calRef}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">예약 날짜</label>
              <button
                type="button"
                onClick={() => setCalOpen((v) => !v)}
                className={`border rounded-xl px-3 py-3 text-left text-sm transition-all focus:outline-none
                  ${calOpen ? "ring-2 border-transparent" : "border-gray-200 bg-gray-50 hover:border-gray-300"}
                `}
                style={calOpen ? { borderColor: company.primaryColor, outline: `2px solid ${company.primaryColor}`, outlineOffset: "-1px" } : {}}
              >
                {dateLabel ? (
                  <span className="text-gray-800 font-medium">{dateLabel}</span>
                ) : (
                  <span className="text-gray-400">날짜를 선택하세요</span>
                )}
                {(pickupDate || returnDate) && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); setPickupDate(""); setReturnDate(""); }}
                    onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), setPickupDate(""), setReturnDate(""))}
                    className="float-right text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    ✕
                  </span>
                )}
              </button>

              {/* Calendar dropdown */}
              {calOpen && (
                <div className="absolute z-50 mt-14 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72">
                  <DateRangePicker
                    startDate={pickupDate}
                    endDate={returnDate}
                    onChange={(s, e) => { setPickupDate(s); setReturnDate(e); }}
                    minDate={today}
                    primaryColor={company.primaryColor}
                  />
                  {pickupDate && returnDate && (
                    <button
                      type="button"
                      onClick={() => setCalOpen(false)}
                      className="mt-3 w-full py-2.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
                      style={{ backgroundColor: company.primaryColor }}
                    >
                      날짜 확인
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full text-white py-3.5 rounded-xl font-bold text-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: company.primaryColor }}
          >
            차량 검색하기
          </button>
        </form>

        <div className="flex justify-center gap-8 mt-10 text-sm opacity-80">
          {["무료 취소", "24시간 지원", "전국 지점"].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
