"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cars, locations } from "@/data/cars";
import Link from "next/link";

function BookingForm() {
  const searchParams = useSearchParams();
  const carId = searchParams.get("carId") ?? "";

  const car = cars.find((c) => c.id === carId);
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    pickupLocation: "",
    returnLocation: "",
    pickupDate: "",
    returnDate: "",
    name: "",
    phone: "",
    email: "",
    driverLicense: "",
    requests: "",
  });
  const [sameLocation, setSameLocation] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (sameLocation) {
      setForm((prev) => ({ ...prev, returnLocation: prev.pickupLocation }));
    }
  }, [sameLocation, form.pickupLocation]);

  const totalDays = useMemo(() => {
    if (!form.pickupDate || !form.returnDate) return 0;
    const diff = new Date(form.returnDate).getTime() - new Date(form.pickupDate).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [form.pickupDate, form.returnDate]);

  const totalPrice = car ? totalDays * car.pricePerDay : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">예약 완료!</h2>
          <p className="text-gray-500 mb-2">예약이 성공적으로 접수되었습니다.</p>
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
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-500">총 결제 금액</span>
              <span className="font-extrabold text-blue-600">{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">차량 예약</h1>
          <p className="text-gray-500 mt-1">예약 정보를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
          {/* 왼쪽: 입력 폼 */}
          <div className="flex-1 space-y-6">
            {/* 차량 선택 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">차량 선택</h2>
              {car ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-12 h-8 text-white/80" fill="currentColor" viewBox="0 0 100 50">
                      <path d="M10,35 L15,20 Q20,10 35,10 L65,10 Q75,10 82,18 L90,28 L92,35 Q92,40 87,40 L80,40 Q78,45 70,45 Q62,45 60,40 L40,40 Q38,45 30,45 Q22,45 20,40 L13,40 Q8,40 8,35 Z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{car.brand} {car.name}</p>
                    <p className="text-sm text-gray-500">{car.seats}인승 · {car.transmission === "auto" ? "자동" : "수동"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">1일</p>
                    <p className="font-bold text-blue-600">{car.pricePerDay.toLocaleString()}원</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 text-sm mb-3">선택된 차량이 없습니다.</p>
                  <Link href="/cars" className="text-blue-600 font-medium text-sm hover:underline">
                    차량 선택하러 가기 →
                  </Link>
                </div>
              )}
            </div>

            {/* 픽업/반납 정보 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-900 mb-4">픽업 / 반납 정보</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      픽업 날짜 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="pickupDate"
                      min={today}
                      value={form.pickupDate}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      반납 날짜 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="returnDate"
                      min={form.pickupDate || today}
                      value={form.returnDate}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    픽업 장소 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="pickupLocation"
                    value={form.pickupLocation}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">지점을 선택하세요</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sameLocation"
                    checked={sameLocation}
                    onChange={(e) => setSameLocation(e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <label htmlFor="sameLocation" className="text-sm text-gray-600 cursor-pointer">
                    반납 장소 동일
                  </label>
                </div>

                {!sameLocation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      반납 장소 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="returnLocation"
                      value={form.returnLocation}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">지점을 선택하세요</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
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
                    <input
                      type="text"
                      name="name"
                      placeholder="홍길동"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="010-0000-0000"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="example@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    운전면허번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="driverLicense"
                    placeholder="12-34-567890-01"
                    value={form.driverLicense}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">요청사항</label>
                  <textarea
                    name="requests"
                    placeholder="특별 요청사항이 있으시면 입력해주세요"
                    value={form.requests}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 예약 요약 */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">예약 요약</h2>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-gray-500">차량</span>
                  <span className="font-medium">{car ? `${car.brand} ${car.name}` : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">대여 기간</span>
                  <span className="font-medium">{totalDays > 0 ? `${totalDays}일` : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">일일 요금</span>
                  <span className="font-medium">{car ? `${car.pricePerDay.toLocaleString()}원` : "-"}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">총 금액</span>
                  <span className="font-extrabold text-blue-600 text-lg">
                    {totalPrice > 0 ? `${totalPrice.toLocaleString()}원` : "-"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!car || !car.available}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-colors"
              >
                예약 확정하기
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                예약 확정 후 24시간 내 무료 취소 가능
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">로딩 중...</div>}>
      <BookingForm />
    </Suspense>
  );
}
