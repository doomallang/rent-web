"use client";

import { useEffect, useState, useRef } from "react";
import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Car, Company } from "@/types";

const categoryLabel: Record<string, string> = {
  ECONOMY: "경형", COMPACT: "준중형/중형", SUV: "SUV", LUXURY: "럭셔리", VAN: "미니밴",
};
const fuelLabel: Record<string, string> = {
  GASOLINE: "가솔린", DIESEL: "디젤", ELECTRIC: "전기", HYBRID: "하이브리드",
};

// ── 스와이프 이미지 갤러리 ──────────────────────────────────────
function ImageGallery({ images, carName }: { images: string[]; carName: string }) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const isDragging = useRef(false);

  const goTo = (idx: number) => setCurrent(Math.max(0, Math.min(images.length - 1, idx)));

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) goTo(current + (dx > 0 ? 1 : -1));
  };

  const onMouseDown = (e: React.MouseEvent) => { startX.current = e.clientX; isDragging.current = true; };
  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dx = startX.current - e.clientX;
    if (Math.abs(dx) > 40) goTo(current + (dx > 0 ? 1 : -1));
  };

  if (images.length === 0) {
    return (
      <div className="h-72 md:h-96 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
        <svg className="w-64 h-40 text-white/80" fill="currentColor" viewBox="0 0 100 50">
          <path d="M10,35 L15,20 Q20,10 35,10 L65,10 Q75,10 82,18 L90,28 L92,35 Q92,40 87,40 L80,40 Q78,45 70,45 Q62,45 60,40 L40,40 Q38,45 30,45 Q22,45 20,40 L13,40 Q8,40 8,35 Z" />
          <circle cx="30" cy="40" r="7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          <circle cx="70" cy="40" r="7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative select-none overflow-hidden" style={{ height: "min(384px, 60vw)" }}>
      {/* 슬라이드 트랙 */}
      <div
        ref={trackRef}
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={() => { isDragging.current = false; }}
      >
        {images.map((url, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0">
            <img
              src={url}
              alt={`${carName} ${idx + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* 좌우 화살표 */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-0 hover:bg-black/60 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => goTo(current + 1)}
            disabled={current === images.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-0 hover:bg-black/60 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 도트 인디케이터 */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`rounded-full transition-all ${idx === current ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50"}`}
              />
            ))}
          </div>

          {/* 카운터 */}
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full">
            {current + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}

export default function CarDetailPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = use(params);
  const [car, setCar] = useState<Car | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/cars/${id}`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/companies?slug=${slug}`).then((r) => r.json()),
    ]).then(([carData, companies]) => {
      const comp: Company | null = companies[0] ?? null;
      if (!carData || !comp || carData.companyId !== comp.id) {
        notFound();
        return;
      }
      setCar(carData);
      setCompany(comp);
    }).finally(() => setLoading(false));
  }, [slug, id]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!car || !company) return null;

  const images = car.images?.length ? car.images : (car.imageUrl ? [car.imageUrl] : []);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={`/${slug}/cars`} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          차량 목록으로
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* 이미지 갤러리 */}
          <div className="relative">
            <ImageGallery images={images} carName={`${car.brand} ${car.name}`} />
            {!car.available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                <span className="bg-white text-gray-800 font-bold px-6 py-2 rounded-full text-lg">현재 예약불가</span>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: company.primaryColor }}>
                    {categoryLabel[car.category]}
                  </span>
                  <span className="text-xs text-gray-400">{car.year}년형</span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">{car.brand} {car.name}</h1>
                <p className="text-gray-500 mt-2">{car.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-gray-400">1일 요금</p>
                <p className="text-4xl font-extrabold" style={{ color: company.primaryColor }}>
                  {car.pricePerDay.toLocaleString()}<span className="text-lg font-normal text-gray-500">원</span>
                </p>
                {(car.weekendPrice || car.holidayPrice) && (
                  <p className="text-xs text-gray-400 mt-1">
                    {car.weekendPrice ? `주말 ${car.weekendPrice.toLocaleString()}원` : ""}
                    {car.weekendPrice && car.holidayPrice ? " · " : ""}
                    {car.holidayPrice ? `공휴일 ${car.holidayPrice.toLocaleString()}원` : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "탑승 인원", value: `${car.seats}인승` },
                { label: "변속기", value: car.transmission === "AUTO" ? "자동" : "수동" },
                { label: "연료", value: fuelLabel[car.fuelType] },
                { label: "연식", value: `${car.year}년` },
              ].map((spec) => (
                <div key={spec.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">{spec.label}</p>
                  <p className="font-bold text-gray-900">{spec.value}</p>
                </div>
              ))}
            </div>

            {car.features.length > 0 && (
              <div className="mb-8">
                <h2 className="font-bold text-gray-900 mb-4">주요 편의사양</h2>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((f) => (
                    <span key={f} className="text-sm font-medium px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: `${company.primaryColor}22`, color: company.primaryColor }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8 p-4 bg-gray-50 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">제공 업체</p>
                <p className="font-bold text-gray-900">{company.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{company.description}</p>
              </div>
              <a href={`tel:${company.phone}`}
                className="flex-shrink-0 flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {company.phone}
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {car.available ? (
                <Link href={`/${slug}/booking?carId=${car.id}`}
                  className="flex-1 text-white py-4 rounded-xl font-bold text-lg text-center transition-opacity hover:opacity-90"
                  style={{ backgroundColor: company.primaryColor }}>
                  지금 예약하기
                </Link>
              ) : (
                <button disabled className="flex-1 bg-gray-200 text-gray-400 py-4 rounded-xl font-bold text-lg cursor-not-allowed">
                  현재 예약불가
                </button>
              )}
              <Link href={`/${slug}/cars`}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-4 rounded-xl font-bold text-lg text-center transition-colors">
                다른 차량 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
