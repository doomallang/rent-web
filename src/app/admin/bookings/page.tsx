"use client";

import { useState, useEffect, useMemo } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Booking, BookingStatus, Company } from "@/types";
import BookingCreateModal from "./BookingCreateModal";

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

const ALL_STATUSES: (BookingStatus | "all")[] = ["all", "PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"];

function formatDate(iso: string) {
  return iso ? iso.slice(0, 10) : "-";
}

function defaultDateRange() {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  return {
    from: today.toISOString().slice(0, 10),
    to: nextWeek.toISOString().slice(0, 10),
  };
}

export default function BookingsPage() {
  const { user } = useAdminAuth();
  const [bookingList, setBookingList] = useState<Booking[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(defaultDateRange().from);
  const [dateTo, setDateTo] = useState(defaultDateRange().to);

  const myCompanyId = user?.role === "company" ? user.companyId : null;
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (myCompanyId) params.set("companyId", myCompanyId);
    params.set("dateFrom", dateFrom);
    params.set("dateTo", dateTo);

    Promise.all([
      fetch(`/api/bookings?${params}`).then((r) => r.json()),
      fetch("/api/companies").then((r) => r.json()),
    ]).then(([bookings, comps]) => {
      setBookingList(Array.isArray(bookings) ? bookings : []);
      setCompanies(comps);
    }).finally(() => setLoading(false));
  }, [myCompanyId, dateFrom, dateTo, refreshKey]);

  const companyMap = Object.fromEntries(companies.map((c) => [c.id, c]));

  const filtered = useMemo(() => {
    return bookingList.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (user?.role === "super" && companyFilter !== "all" && b.companyId !== companyFilter) return false;
      if (search && !b.customerName.includes(search) && !b.id.includes(search) && !b.customerPhone.includes(search)) return false;
      return true;
    });
  }, [bookingList, statusFilter, companyFilter, search, user]);

  const changeStatus = async (id: string, status: BookingStatus) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    setBookingList((prev) => prev.map((b) => b.id === id ? updated : b));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">예약 관리</h1>
          <p className="text-gray-500 text-sm mt-1">총 {filtered.length}건</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          예약 직접 등록
        </button>
      </div>

      {/* 필터 */}
      <div className="flex flex-col gap-3">
        {/* 날짜 범위 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">조회 기간</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <span className="text-gray-400 text-sm">~</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            onClick={() => { const r = defaultDateRange(); setDateFrom(r.from); setDateTo(r.to); }}
            className="text-xs text-blue-500 hover:text-blue-700 underline whitespace-nowrap"
          >
            오늘~1주일
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const d = new Date(today); d.setDate(today.getDate() + 30);
              setDateFrom(today.toISOString().slice(0, 10));
              setDateTo(d.toISOString().slice(0, 10));
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline whitespace-nowrap"
          >
            오늘~1달
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* 상태 탭 */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {s === "all" ? "전체" : statusLabel[s as BookingStatus]}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-1">
            {user?.role === "super" && (
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">전체 업체</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="고객명, 예약번호, 전화번호 검색"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-gray-500 font-medium px-4 py-3">예약번호</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">고객</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">차량</th>
                {user?.role === "super" && <th className="text-left text-gray-500 font-medium px-4 py-3">업체</th>}
                <th className="text-left text-gray-500 font-medium px-4 py-3">기간</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">금액</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{booking.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{booking.customerName}</p>
                    <p className="text-xs text-gray-400">{booking.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {booking.car ? `${booking.car.brand} ${booking.car.name}` : "-"}
                  </td>
                  {user?.role === "super" && (
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {booking.company?.name ?? (booking.companyId ? companyMap[booking.companyId]?.name : null) ?? "(삭제된 업체)"}
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(booking.pickupDate)} ~ {formatDate(booking.returnDate)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {booking.totalPrice.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={booking.status}
                      onChange={(e) => changeStatus(booking.id, e.target.value as BookingStatus)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${statusStyle[booking.status]}`}
                    >
                      {(Object.keys(statusLabel) as BookingStatus[]).map((s) => (
                        <option key={s} value={s}>{statusLabel[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={user?.role === "super" ? 7 : 6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    예약 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {showCreate && (
      <BookingCreateModal
        myCompanyId={myCompanyId ?? null}
        companies={companies}
        onSuccess={() => {
          setShowCreate(false);
          setRefreshKey((k) => k + 1);
        }}
        onClose={() => setShowCreate(false)}
      />
    )}
    </>
  );
}
