"use client";
import { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  primaryColor?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "선택하세요",
  className = "",
  primaryColor = "#2563EB",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all text-left
          ${open
            ? "bg-white shadow-sm"
            : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-white"
          }`}
        style={open ? { borderColor: primaryColor, outline: `2px solid ${primaryColor}20` } : {}}
      >
        <span className={selected ? "text-gray-800 font-medium" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden
          animate-in fade-in slide-in-from-top-1 duration-150">
          <ul className="max-h-56 overflow-y-auto py-1.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left
                      ${isSelected ? "font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                    style={isSelected ? { color: primaryColor, backgroundColor: `${primaryColor}0d` } : {}}
                  >
                    {opt.label}
                    {isSelected && (
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
