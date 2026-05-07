"use client";

import { useState, useEffect, useMemo, Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Car, Company, Location } from "@/types";
import { calculatePricing, DayBreakdown } from "@/lib/pricing";
import CustomSelect from "@/components/ui/CustomSelect";

function BookingForm({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const carId = searchParams.get("carId") ?? "";

  const [company, setCompany] = useState<Company | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [bookedRanges, setBookedRanges] = useState<{ start: string; end: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    pickupLocation: "", returnLocation: "", pickupDate: "", returnDate: "",
    name: "", phone: "", email: "", driverLicense: "", requests: "",
  });
  const [sameLocation, setSameLocation] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{ phone?: string; driverLicense?: string }>({});

  useEffect(() => {
    Promise.all([
      fetch(`/api/companies?slug=${slug}`).then((r) => r.json()),
      carId ? fetch(`/api/cars/${carId}`).then((r) => r.ok ? r.json() : null) : Promise.resolve(null),
    ]).then(async ([companies, carData]) => {
      const comp: Company | null = companies[0] ?? null;
      setCompany(comp);
      if (carData && comp && carData.companyId === comp.id) {
        setCar(carData);
        const [locs, avail] = await Promise.all([
          fetch(`/api/locations?companyId=${comp.id}`).then((r) => r.json()),
          fetch(`/api/cars/${carId}/availability`).then((r) => r.json()),
        ]);
        setLocations(Array.isArray(locs) ? locs : []);
        setBookedRanges(Array.isArray(avail) ? avail : []);
      } else if (comp) {
        const locs = await fetch(`/api/locations?companyId=${comp.id}`).then((r) => r.json());
        setLocations(Array.isArray(locs) ? locs : []);
      }
    }).finally(() => setLoading(false));
  }, [slug, carId]);

  useEffect(() => {
    if (sameLocation) setForm((p) => ({ ...p, returnLocation: p.pickupLocation }));
  }, [sameLocation, form.pickupLocation]);

  // 선택한 날짜 범위가 기존 예약과 겹치는지 확인
  const dateConflict = useMemo(() => {
    if (!form.pickupDate || !form.returnDate || bookedRanges.length === 0) return null;
    const pick = form.pickupDate;
    const ret = form.returnDate;
    const conflict = bookedRanges.find((r) => pick < r.end && ret > r.start);
    return conflict ? `${conflict.start} ~ ${conflict.end}` : null;
  }, [form.pickupDate, form.returnDate, bookedRanges]);

  const pricing = useMemo(() => {
    if (!car || !form.pickupDate || !form.returnDate || dateConflict) return null;
    return calculatePricing(form.pickupDate, form.returnDate, car);
  }, [car, form.pickupDate, form.returnDate, dateConflict]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // 전화번호: 숫자만 추출 후 010-XXXX-XXXX 형태로 자동 포맷
  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setForm((p) => ({ ...p, phone: formatted }));
    const digits = formatted.replace(/\D/g, "");
    if (digits.length > 0 && (digits.length < 10 || digits.length > 11)) {
      setFieldErrors((p) => ({ ...p, phone: "올바른 전화번호를 입력해주세요 (예: 010-1234-5678)" }));
    } else {
      setFieldErrors((p) => ({ ...p, phone: undefined }));
    }
  };

  // 운전면허번호: 숫자만 추출 후 XX-XX-XXXXXX-XX 형태로 자동 포맷
  const formatLicense = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 12);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 10)}-${digits.slice(10)}`;
  };

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicense(e.target.value);
    setForm((p) => ({ ...p, driverLicense: formatted }));
    const digits = formatted.replace(/\D/g, "");
    if (digits.length > 0 && digits.length < 12) {
      setFieldErrors((p) => ({ ...p, driverLicense: "운전면허번호는 12자리입니다 (예: 12-34-567890-01)" }));
    } else {
      setFieldErrors((p) => ({ ...p, driverLicense: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car || !company || !pricing || pricing.days === 0) return;

    // 최종 검증
    const phoneDigits = form.phone.replace(/\D/g, "");
    const licenseDigits = form.driverLicense.replace(/\D/g, "");
    const errors: typeof fieldErrors = {};
    if (phoneDigits.length < 10 || phoneDigits.length > 11) errors.phone = "올바른 전화번호를 입력해주세요 (예: 010-1234-5678)";
    if (licenseDigits.length !== 12) errors.driverLicense = "운전면허번호는 12자리입니다 (예: 12-34-567890-01)";
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car.id,
          companyId: company.id,
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email,
          driverLicense: form.driverLicense,
          pickupLocation: form.pickupLocation,
          returnLocation: form.returnLocation,
          pickupDate: form.pickupDate,
          returnDate: form.returnDate,
          totalPrice: pricing.total,
          requests: form.requests,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "예약 중 오류가 발생했습니다.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        업체를 찾을 수 없습니다.
      </div>
    );
  }

  if (submitted && pricing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${company.primaryColor}22` }}>
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              style={{ color: company.primaryColor }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">예약 완료!</h2>
          <p className="text-gray-500 mb-8">
            입력하신 이메일 <strong>{form.email}</strong>로 예약 확인서가 발송됩니다.
          </p>
          <div className="bg-gray-50 rounded-2xl p-5 text-left mb-8 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">차량</span>
              <span className="font-semibold">{car?.brand} {car?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">픽업</span>
              <span className="font-semibold">{form.pickupDate} / {form.pickupLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">반납</span>
              <span className="font-semibold">{form.returnDate} / {form.returnLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">대여 기간</span>
              <span className="font-semibold">{pricing.days}일</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="font-bold text-gray-900">총 결제 금액</span>
              <span className="font-extrabold text-lg" style={{ color: company.primaryColor }}>
                {pricing.total.toLocaleString()}원
              </span>
            </div>
          </div>
          <Link href={`/${slug}`}
            className="inline-block text-white px-8 py-3 rounded-xl font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: company.primaryColor }}>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const thumb = car?.images?.[0] ?? car?.imageUrl;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href={`/${slug}/cars`} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-3 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            차량 목록으로
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">차량 예약</h1>
          <p className="text-gray-500 mt-1">{company.name} — 예약 정보를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">

            {/* 선택 차량 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">선택 차량</h2>
              {car ? (
                <div className="flex items-center gap-4">
                  {thumb ? (
                    <img src={thumb} alt={car.name}
                      className="w-20 h-14 object-cover rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${company.primaryColor}88, ${company.primaryColor})` }}>
                      <svg className="w-10 h-7 text-white/80" fill="currentColor" viewBox="0 0 100 50">
                        <path d="M10,35 L15,20 Q20,10 35,10 L65,10 Q75,10 82,18 L90,28 L92,35 Q92,40 87,40 L80,40 Q78,45 70,45 Q62,45 60,40 L40,40 Q38,45 30,45 Q22,45 20,40 L13,40 Q8,40 8,35 Z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{car.brand} {car.name}</p>
                    <p className="text-sm text-gray-500">{car.seats}인승 · {car.transmission === "AUTO" ? "자동" : "수동"}</p>
                    {(car.weekendPrice || car.holidayPrice) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        평일 {car.pricePerDay.toLocaleString()}원
                        {car.weekendPrice ? ` · 주말 ${car.weekendPrice.toLocaleString()}원` : ""}
                        {car.holidayPrice ? ` · 공휴일 ${car.holidayPrice.toLocaleString()}원` : ""}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">평일 1일</p>
                    <p className="font-bold text-lg" style={{ color: company.primaryColor }}>
                      {car.pricePerDay.toLocaleString()}원
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 text-sm mb-3">선택된 차량이 없습니다.</p>
                  <Link href={`/${slug}/cars`} className="text-sm font-medium hover:underline"
                    style={{ color: company.primaryColor }}>
                    차량 선택하러 가기 →
                  </Link>
                </div>
              )}
            </div>

            {/* 픽업 / 반납 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">픽업 / 반납 정보</h2>
              <div className="space-y-4">

                {/* 예약 불가 기간 안내 */}
                {bookedRanges.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold text-amber-700 mb-1.5">이미 예약된 기간</p>
                    <div className="flex flex-wrap gap-1.5">
                      {bookedRanges.map((r, i) => (
                        <span key={i} className="text-xs bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
                          {r.start} ~ {r.end}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      픽업 날짜 <span className="text-red-500">*</span>
                    </label>
                    <input type="date" name="pickupDate" min={today} value={form.pickupDate}
                      onChange={handleChange} required
                      className={`w-full border rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 ${dateConflict ? "border-red-300 focus:ring-red-400 bg-red-50" : "border-gray-200 focus:ring-blue-500"}`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      반납 날짜 <span className="text-red-500">*</span>
                    </label>
                    <input type="date" name="returnDate" min={form.pickupDate || today} value={form.returnDate}
                      onChange={handleChange} required
                      className={`w-full border rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 ${dateConflict ? "border-red-300 focus:ring-red-400 bg-red-50" : "border-gray-200 focus:ring-blue-500"}`} />
                  </div>
                </div>

                {/* 날짜 충돌 경고 */}
                {dateConflict && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <p className="text-sm text-red-700">
                      선택한 기간에 이미 예약된 날짜(<strong>{dateConflict}</strong>)가 포함되어 있습니다. 다른 날짜를 선택해주세요.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    픽업 장소 <span className="text-red-500">*</span>
                  </label>
                  {locations.length > 0 ? (
                    <CustomSelect
                      value={form.pickupLocation}
                      onChange={(v) => setForm((p) => ({ ...p, pickupLocation: v }))}
                      options={locations.map((loc) => ({
                        value: loc.name,
                        label: loc.name + (loc.address ? ` — ${loc.address}` : ""),
                      }))}
                      placeholder="지점을 선택하세요"
                      primaryColor={company?.primaryColor}
                    />
                  ) : (
                    <input type="text" name="pickupLocation" value={form.pickupLocation} onChange={handleChange}
                      required placeholder="픽업 장소를 직접 입력해주세요"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="same" checked={sameLocation}
                    onChange={(e) => setSameLocation(e.target.checked)} className="w-4 h-4" />
                  <label htmlFor="same" className="text-sm text-gray-600 cursor-pointer">반납 장소 동일</label>
                </div>

                {!sameLocation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      반납 장소 <span className="text-red-500">*</span>
                    </label>
                    {locations.length > 0 ? (
                      <CustomSelect
                        value={form.returnLocation}
                        onChange={(v) => setForm((p) => ({ ...p, returnLocation: v }))}
                        options={locations.map((loc) => ({
                          value: loc.name,
                          label: loc.name + (loc.address ? ` — ${loc.address}` : ""),
                        }))}
                        placeholder="지점을 선택하세요"
                        primaryColor={company?.primaryColor}
                      />
                    ) : (
                      <input type="text" name="returnLocation" value={form.returnLocation} onChange={handleChange}
                        required placeholder="반납 장소를 직접 입력해주세요"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 예약자 정보 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">예약자 정보</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="name" placeholder="홍길동" value={form.name}
                      onChange={handleChange} required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input type="tel" name="phone" placeholder="010-0000-0000" value={form.phone}
                      onChange={handlePhoneChange} required inputMode="numeric"
                      className={`w-full border rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 ${fieldErrors.phone ? "border-red-300 focus:ring-red-400 bg-red-50" : "border-gray-200 focus:ring-blue-500"}`} />
                    {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input type="email" name="email" placeholder="example@email.com" value={form.email}
                    onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    운전면허번호 <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="driverLicense" placeholder="12-34-567890-01" value={form.driverLicense}
                    onChange={handleLicenseChange} required inputMode="numeric"
                    className={`w-full border rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 ${fieldErrors.driverLicense ? "border-red-300 focus:ring-red-400 bg-red-50" : "border-gray-200 focus:ring-blue-500"}`} />
                  {fieldErrors.driverLicense && <p className="text-xs text-red-500 mt-1">{fieldErrors.driverLicense}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">요청사항</label>
                  <textarea name="requests" value={form.requests} onChange={handleChange} rows={3}
                    placeholder="특별 요청사항이 있으시면 입력해주세요"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </div>
            </div>
          </div>

          {/* 예약 요약 사이드바 */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24 space-y-4">
              <h2 className="font-bold text-gray-900">예약 요약</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">차량</span>
                  <span className="font-medium">{car ? `${car.brand} ${car.name}` : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">대여 기간</span>
                  <span className="font-medium">{pricing ? `${pricing.days}일` : "-"}</span>
                </div>
              </div>

              {/* 요금 상세 내역 */}
              {pricing && pricing.days > 0 && (
                <PriceBreakdown breakdown={pricing.breakdown} primaryColor={company.primaryColor} />
              )}

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900">총 금액</span>
                <span className="font-extrabold text-xl" style={{ color: company.primaryColor }}>
                  {pricing && pricing.total > 0 ? `${pricing.total.toLocaleString()}원` : "-"}
                </span>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={!car || !car.available || !pricing || pricing.days === 0 || !!dateConflict || submitting}
                className="w-full text-white py-3.5 rounded-xl font-bold transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ backgroundColor: company.primaryColor }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    처리 중…
                  </span>
                ) : "예약 확정하기"}
              </button>

              {car && !car.available && (
                <p className="text-xs text-red-500 text-center">현재 예약이 불가능한 차량입니다.</p>
              )}
              <p className="text-xs text-gray-400 text-center">예약 확정 후 24시간 내 무료 취소 가능</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 요금 상세 내역 컴포넌트 ──────────────────────────────────────
function PriceBreakdown({ breakdown, primaryColor }: { breakdown: DayBreakdown[]; primaryColor: string }) {
  const [open, setOpen] = useState(false);

  // 동일한 타입/요금이 연속되면 묶어서 표시
  const grouped: { type: string; price: number; count: number; label?: string }[] = [];
  for (const d of breakdown) {
    const last = grouped[grouped.length - 1];
    const label = d.type === "특별요금" ? (d.label ?? "특별요금") : d.type;
    if (last && last.type === label && last.price === d.price) {
      last.count++;
    } else {
      grouped.push({ type: label, price: d.price, count: 1, label: d.label });
    }
  }

  const hasVaried = grouped.length > 1;

  if (!hasVaried) {
    return (
      <div className="text-sm flex justify-between text-gray-500">
        <span>{grouped[0]?.type} {breakdown.length}일 × {grouped[0]?.price.toLocaleString()}원</span>
      </div>
    );
  }

  return (
    <div className="text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-gray-500 hover:text-gray-700"
      >
        <span>요금 상세 보기</span>
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 bg-gray-50 rounded-lg p-3">
          {grouped.map((g, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-gray-500">
                {g.type} {g.count}일 × {g.price.toLocaleString()}원
              </span>
              <span className="font-medium" style={{ color: primaryColor }}>
                {(g.price * g.count).toLocaleString()}원
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingForm slug={slug} />
    </Suspense>
  );
}
