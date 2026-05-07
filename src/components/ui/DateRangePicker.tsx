"use client";
import { useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export interface DateRangePickerProps {
  startDate: string;   // "" | "YYYY-MM-DD"
  endDate: string;
  onChange: (start: string, end: string) => void;
  minDate?: string;
  primaryColor?: string;
}

function fmt(d: Date) {
  return (
    d.getFullYear() +
    "-" + String(d.getMonth() + 1).padStart(2, "0") +
    "-" + String(d.getDate()).padStart(2, "0")
  );
}

function displayDate(ds: string) {
  if (!ds) return null;
  const [, m, d] = ds.split("-");
  return `${+m}월 ${+d}일`;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  minDate,
  primaryColor = "#2563EB",
}: DateRangePickerProps) {
  const todayStr = fmt(new Date());
  const minStr = minDate ?? todayStr;

  const [yr, setYr] = useState(() => {
    const base = startDate ? new Date(startDate + "T00:00:00") : new Date();
    return base.getFullYear();
  });
  const [mo, setMo] = useState(() => {
    const base = startDate ? new Date(startDate + "T00:00:00") : new Date();
    return base.getMonth();
  });
  const [hover, setHover] = useState("");

  // live range preview while hovering during second selection
  const effectiveEnd = startDate && !endDate && hover ? hover : endDate;
  const [rS, rE] = (() => {
    if (!startDate || !effectiveEnd) return ["", ""];
    return startDate <= effectiveEnd
      ? [startDate, effectiveEnd]
      : [effectiveEnd, startDate];
  })();

  const prevMonth = () => {
    if (mo === 0) { setYr((y) => y - 1); setMo(11); }
    else setMo((m) => m - 1);
  };
  const nextMonth = () => {
    if (mo === 11) { setYr((y) => y + 1); setMo(0); }
    else setMo((m) => m + 1);
  };

  const minD = new Date(minStr + "T00:00:00");
  const canPrev = !(yr === minD.getFullYear() && mo <= minD.getMonth());

  // Build cell array: nulls for leading empty slots, then YYYY-MM-DD strings
  const firstDOW = new Date(yr, mo, 1).getDay();
  const daysInMo = new Date(yr, mo + 1, 0).getDate();
  const cells: (string | null)[] = Array(firstDOW).fill(null);
  for (let d = 1; d <= daysInMo; d++) cells.push(fmt(new Date(yr, mo, d)));
  while (cells.length % 7) cells.push(null);

  const handleClick = (ds: string) => {
    if (ds < minStr) return;
    if (!startDate || endDate) {
      onChange(ds, "");
    } else if (ds === startDate) {
      onChange("", "");
    } else if (ds < startDate) {
      onChange(ds, startDate);
    } else {
      onChange(startDate, ds);
    }
  };

  const selecting = !!(startDate && !endDate);

  return (
    <div className="w-full select-none">
      {/* Selected dates summary */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold transition-all
          ${startDate ? "text-white" : "bg-gray-100 text-gray-400"}`}
          style={startDate ? { backgroundColor: primaryColor } : {}}
        >
          {startDate ? displayDate(startDate) : "픽업 날짜"}
        </div>
        <svg className="w-4 h-4 flex-shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
        <div className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold transition-all
          ${endDate ? "text-white" : selecting ? "bg-gray-100 text-gray-500 ring-2 ring-dashed ring-gray-300" : "bg-gray-100 text-gray-400"}`}
          style={endDate ? { backgroundColor: primaryColor } : {}}
        >
          {endDate ? displayDate(endDate) : "반납 날짜"}
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          disabled={!canPrev}
          className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors
            ${canPrev ? "text-gray-500 hover:bg-gray-100" : "text-gray-200 cursor-not-allowed"}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-bold text-gray-900">{yr}년 {mo + 1}월</span>
        <button
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={`text-center text-[10px] font-bold py-1.5
            ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((ds, i) => {
          if (!ds) return <div key={`_${i}`} className="h-9" />;

          const day = +ds.slice(8);
          const col = i % 7;
          const disabled = ds < minStr;
          const isSel = ds === startDate || ds === endDate;
          const inRange = !!(rS && rE && ds > rS && ds < rE);
          const isRangeStart = !!(rS && rE && ds === rS && rS !== rE);
          const isRangeEnd = !!(rS && rE && ds === rE && rS !== rE);
          const isToday = ds === todayStr;
          const showBar = inRange || isRangeStart || isRangeEnd;

          return (
            <div
              key={ds}
              className="relative h-9 flex items-center justify-center"
              onMouseEnter={() => !disabled && setHover(ds)}
              onMouseLeave={() => setHover("")}
            >
              {/* Range fill bar */}
              {showBar && (
                <div
                  className="absolute top-1 bottom-1 pointer-events-none"
                  style={{
                    backgroundColor: `${primaryColor}18`,
                    left: isRangeStart ? "50%" : 0,
                    right: isRangeEnd ? "50%" : 0,
                  }}
                />
              )}

              {/* Day button */}
              <button
                onClick={() => !disabled && handleClick(ds)}
                disabled={disabled}
                className={`relative z-10 w-8 h-8 rounded-full text-[12px] transition-all flex items-center justify-center
                  ${isSel ? "font-bold shadow-md scale-105" : "font-medium"}
                  ${!isSel && !disabled ? "hover:bg-gray-100" : ""}
                  ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                `}
                style={
                  isSel
                    ? { backgroundColor: primaryColor, color: "#fff" }
                    : {
                        color: disabled
                          ? "#e5e7eb"
                          : col === 0
                          ? "#f87171"
                          : col === 6
                          ? "#60a5fa"
                          : "#111827",
                      }
                }
              >
                {day}
              </button>

              {/* Today dot */}
              {isToday && !isSel && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full z-10 pointer-events-none"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Hint text */}
      <p className="text-center text-[11px] text-gray-400 mt-3">
        {!startDate
          ? "픽업 날짜를 선택하세요"
          : !endDate
          ? "반납 날짜를 선택하세요"
          : null}
      </p>
    </div>
  );
}
