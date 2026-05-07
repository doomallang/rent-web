"use client";

import { useState, useEffect, useMemo } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Booking, Car, Company, BookingStatus } from "@/types";

const statusLabel: Record<BookingStatus, string> = {
  PENDING: "대기중", CONFIRMED: "확정", ACTIVE: "진행중", COMPLETED: "완료", CANCELLED: "취소",
};

const statusStyle: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
};

function formatDate(iso: string) {
  return iso ? iso.slice(0, 10) : "-";
}

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const myCompanyId = user?.role === "company" ? user.companyId : null;

  useEffect(() => {
    const bookingsUrl = myCompanyId ? `/api/bookings?companyId=${myCompanyId}` : "/api/bookings";
    const carsUrl = myCompanyId ? `/api/cars?companyId=${myCompanyId}` : "/api/cars";
    Promise.all([
      fetch(bookingsUrl).then((r) => r.json()),
      fetch(carsUrl).then((r) => r.json()),
      fetch("/api/companies").then((r) => r.json()),
    ]).then(([b, c, co]) => {
      setBookings(b);
      setCars(c);
      setCompanies(co);
    }).finally(() => setLoading(false));
  }, [myCompanyId]);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    active: bookings.filter((b) => b.status === "ACTIVE").length,
    revenue: bookings.filter((b) => b.status !== "CANCELLED").reduce((sum, b) => sum + b.totalPrice, 0),
    availableCars: cars.filter((c) => c.available).length,
    totalCars: cars.length,
  }), [bookings, cars]);

  const recentBookings = useMemo(
    () => [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    [bookings]
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">대시보드</h1>
        <p className="text-gray-500 text-sm mt-1">
          {user?.role === "super" ? "전체 업체 현황" : `${user?.companyName} 현황`}
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "전체 예약", value: stats.total, sub: "건", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "대기중 예약", value: stats.pending, sub: "건", color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "진행중 예약", value: stats.active, sub: "건", color: "text-green-600", bg: "bg-green-50" },
          { label: "총 수익", value: stats.revenue.toLocaleString(), sub: "원", color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-3`}>
              <span className={`text-lg font-extrabold ${stat.color}`}>#</span>
            </div>
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${stat.color}`}>
              {stat.value}<span className="text-base font-normal text-gray-400 ml-0.5">{stat.sub}</span>
            </p>
          </div>
        ))}
      </div>

      {/* 차량 현황 + 업체별/상태 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4">차량 현황</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${stats.totalCars ? (stats.availableCars / stats.totalCars) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 flex-shrink-0">{stats.availableCars} / {stats.totalCars}대</span>
          </div>
          <div className="space-y-2">
            {cars.slice(0, 5).map((car) => (
              <div key={car.id} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-700">{car.brand} {car.name}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${car.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {car.available ? "예약가능" : "예약중"}
                </span>
              </div>
            ))}
            {cars.length > 5 && <p className="text-xs text-gray-400 pt-1">+{cars.length - 5}대 더보기</p>}
          </div>
        </div>

        {user?.role === "super" ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4">업체별 예약 현황</h2>
            <div className="space-y-3">
              {companies.map((company) => {
                const cb = bookings.filter((b) => b.companyId === company.id);
                const revenue = cb.filter((b) => b.status !== "CANCELLED").reduce((s, b) => s + b.totalPrice, 0);
                return (
                  <div key={company.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{company.name}</p>
                      <p className="text-xs text-gray-400">예약 {cb.length}건</p>
                    </div>
                    <p className="text-sm font-bold text-blue-600">{revenue.toLocaleString()}원</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4">예약 상태 요약</h2>
            <div className="space-y-3">
              {(Object.keys(statusLabel) as BookingStatus[]).map((status) => {
                const count = bookings.filter((b) => b.status === status).length;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[status]}`}>
                      {statusLabel[status]}
                    </span>
                    <span className="text-sm font-bold text-gray-700">{count}건</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 최근 예약 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-4">최근 예약</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-400 font-medium pb-3 pr-4">고객명</th>
                <th className="text-left text-gray-400 font-medium pb-3 pr-4">차량</th>
                {user?.role === "super" && <th className="text-left text-gray-400 font-medium pb-3 pr-4">업체</th>}
                <th className="text-left text-gray-400 font-medium pb-3 pr-4">기간</th>
                <th className="text-left text-gray-400 font-medium pb-3 pr-4">금액</th>
                <th className="text-left text-gray-400 font-medium pb-3">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-900">{booking.customerName}</td>
                  <td className="py-3 pr-4 text-gray-600">
                    {booking.car ? `${booking.car.brand} ${booking.car.name}` : "-"}
                  </td>
                  {user?.role === "super" && (
                    <td className="py-3 pr-4 text-gray-600">{booking.company?.name}</td>
                  )}
                  <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                    {formatDate(booking.pickupDate)} ~ {formatDate(booking.returnDate)}
                  </td>
                  <td className="py-3 pr-4 font-medium text-gray-900">
                    {booking.totalPrice.toLocaleString()}원
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[booking.status]}`}>
                      {statusLabel[booking.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={user?.role === "super" ? 6 : 5} className="py-10 text-center text-gray-400 text-sm">
                    예약 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
