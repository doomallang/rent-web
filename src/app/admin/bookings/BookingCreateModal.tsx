"use client";

import { useState, useEffect, useMemo } from "react";
import { Car, Company, Location, BookingStatus } from "@/types";
import DateRangePicker from "@/components/ui/DateRangePicker";
import CustomSelect from "@/components/ui/CustomSelect";

interface Props {
  myCompanyId: string | null;
  companies: Company[];
  onSuccess: () => void;
  onClose: () => void;
}

const statusOptions = [
  { value: "CONFIRMED", label: "확정" },
  { value: "PENDING",   label: "대기중" },
  { value: "ACTIVE",    label: "진행중" },
];

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7)  return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export default function BookingCreateModal({ myCompanyId, companies, onSuccess, onClose }: Props) {
  // company / car / location state
  const [companyId, setCompanyId] = useState(myCompanyId ?? "");
  const [cars, setCars] = useState<Car[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [carId, setCarId] = useState("");
  const [conflict, setConflict] = useState<string | null>(null);

  // form fields
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [returnLocation, setReturnLocation] = useState("");
  const [sameLocation, setSameLocation] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [license, setLicense] = useState("");
  const [requests, setRequests] = useState("");
  const [status, setStatus] = useState<BookingStatus>("CONFIRMED");
  const [priceOverride, setPriceOverride] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedCompany = companies.find((c) => c.id === companyId);
  const selectedCar = cars.find((c) => c.id === carId);

  // Load cars + locations when company changes
  useEffect(() => {
    if (!companyId) { setCars([]); setLocations([]); setCarId(""); return; }
    Promise.all([
      fetch(`/api/cars?companyId=${companyId}`).then((r) => r.json()),
      fetch(`/api/locations?companyId=${companyId}`).then((r) => r.json()),
    ]).then(([c, l]) => {
      setCars(Array.isArray(c) ? c : []);
      setLocations(Array.isArray(l) ? l : []);
      setCarId("");
      setPickupLocation("");
      setReturnLocation("");
    });
  }, [companyId]);

  // Auto-sync return location
  useEffect(() => {
    if (sameLocation) setReturnLocation(pickupLocation);
  }, [sameLocation, pickupLocation]);

  // Check availability when car + dates set
  useEffect(() => {
    if (!carId || !pickupDate || !returnDate) { setConflict(null); return; }
    fetch(`/api/cars/${carId}/availability`).then((r) => r.json()).then((ranges) => {
      if (!Array.isArray(ranges)) return;
      const found = (ranges as { start: string; end: string }[]).find(
        (r) => pickupDate < r.end && returnDate > r.start
      );
      setConflict(found ? `${found.start} ~ ${found.end}` : null);
    });
  }, [carId, pickupDate, returnDate]);

  // Auto-calculate price
  const calcPrice = useMemo(() => {
    if (!selectedCar || !pickupDate || !returnDate) return 0;
    const days = Math.max(1, Math.ceil(
      (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / 86400000
    ));
    return days * selectedCar.pricePerDay;
  }, [selectedCar, pickupDate, returnDate]);

  // Reset price override when calculation changes
  useEffect(() => { setPriceOverride(""); }, [calcPrice]);

  const totalPrice = priceOverride !== "" ? Number(priceOverride) : calcPrice;

  const primaryColor = selectedCompany?.primaryColor ?? "#2563EB";

  const isValid =
    companyId && carId && pickupDate && returnDate &&
    pickupLocation && (sameLocation || returnLocation) &&
    name && phone.replace(/\D/g, "").length >= 10 &&
    !conflict;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId,
          companyId,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          driverLicense: license,
          pickupLocation,
          returnLocation: sameLocation ? pickupLocation : returnLocation,
          pickupDate,
          returnDate,
          totalPrice,
          requests,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "등록 중 오류가 발생했습니다.");
        return;
      }
      onSuccess();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">예약 직접 등록</h2>
            <p className="text-xs text-gray-400 mt-0.5">전화·방문 예약을 직접 등록합니다</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* ─── 차량 선택 ─── */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: primaryColor }}>1</span>
              차량 선택
            </h3>
            <div className="space-y-3">
              {!myCompanyId && (
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">업체</label>
                  <CustomSelect
                    value={companyId}
                    onChange={setCompanyId}
                    options={companies.map((c) => ({ value: c.id, label: c.name }))}
                    placeholder="업체를 선택하세요"
                    primaryColor="#2563EB"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">차량</label>
                <CustomSelect
                  value={carId}
                  onChange={setCarId}
                  options={cars.map((c) => ({
                    value: c.id,
                    label: `${c.brand} ${c.name} — ${c.pricePerDay.toLocaleString()}원/일`,
                  }))}
                  placeholder={companyId ? "차량을 선택하세요" : "업체를 먼저 선택하세요"}
                  primaryColor={primaryColor}
                />
              </div>
            </div>
          </section>

          {/* ─── 예약 기간 ─── */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: primaryColor }}>2</span>
              예약 기간
            </h3>
            <div className="bg-gray-50 rounded-2xl p-4">
              <DateRangePicker
                startDate={pickupDate}
                endDate={returnDate}
                onChange={(s, e) => { setPickupDate(s); setReturnDate(e); }}
                primaryColor={primaryColor}
              />
            </div>
            {conflict && (
              <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-xs text-red-700"><strong>{conflict}</strong>에 이미 예약이 있습니다.</p>
              </div>
            )}
          </section>

          {/* ─── 픽업·반납 장소 ─── */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: primaryColor }}>3</span>
              픽업 · 반납 장소
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">픽업 장소</label>
                {locations.length > 0 ? (
                  <CustomSelect
                    value={pickupLocation}
                    onChange={setPickupLocation}
                    options={locations.map((l) => ({ value: l.name, label: l.name }))}
                    placeholder="지점을 선택하세요"
                    primaryColor={primaryColor}
                  />
                ) : (
                  <input value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="픽업 장소 입력"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" />
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sameLocation} onChange={(e) => setSameLocation(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm text-gray-600">반납 장소 동일</span>
              </label>
              {!sameLocation && (
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">반납 장소</label>
                  {locations.length > 0 ? (
                    <CustomSelect
                      value={returnLocation}
                      onChange={setReturnLocation}
                      options={locations.map((l) => ({ value: l.name, label: l.name }))}
                      placeholder="지점을 선택하세요"
                      primaryColor={primaryColor}
                    />
                  ) : (
                    <input value={returnLocation} onChange={(e) => setReturnLocation(e.target.value)}
                      placeholder="반납 장소 입력"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2" />
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ─── 고객 정보 ─── */}
          <section>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: primaryColor }}>4</span>
              고객 정보
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">이름 <span className="text-red-400">*</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">연락처 <span className="text-red-400">*</span></label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="010-0000-0000"
                  inputMode="numeric"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">이메일</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" type="email"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">운전면허번호</label>
                <input value={license} onChange={(e) => setLicense(e.target.value)} placeholder="00-00-000000-00"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-gray-500 mb-1 block">요청사항</label>
              <textarea value={requests} onChange={(e) => setRequests(e.target.value)} rows={2}
                placeholder="고객 요청사항 메모"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </section>

          {/* ─── 금액 · 상태 ─── */}
          <section className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">결제 금액</label>
                <div className="relative">
                  <input
                    value={priceOverride !== "" ? priceOverride : (calcPrice > 0 ? String(calcPrice) : "")}
                    onChange={(e) => setPriceOverride(e.target.value.replace(/\D/g, ""))}
                    placeholder={calcPrice > 0 ? calcPrice.toLocaleString() : "자동 계산"}
                    inputMode="numeric"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">원</span>
                </div>
                {calcPrice > 0 && priceOverride !== "" && (
                  <button onClick={() => setPriceOverride("")} className="text-[11px] text-blue-500 hover:underline mt-0.5">
                    자동 계산으로 되돌리기 ({calcPrice.toLocaleString()}원)
                  </button>
                )}
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">예약 상태</label>
                <CustomSelect
                  value={status}
                  onChange={(v) => setStatus(v as BookingStatus)}
                  options={statusOptions}
                  primaryColor={primaryColor}
                />
              </div>
            </div>
            {totalPrice > 0 && (
              <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                <span className="text-sm text-gray-500">최종 금액</span>
                <span className="text-lg font-extrabold" style={{ color: primaryColor }}>
                  {totalPrice.toLocaleString()}원
                </span>
              </div>
            )}
          </section>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: primaryColor }}
          >
            {submitting ? "등록 중…" : "예약 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
