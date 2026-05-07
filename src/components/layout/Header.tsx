"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">드라이브온</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/cars" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              차량 둘러보기
            </Link>
            <Link href="/#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              이용방법
            </Link>
            <Link href="/#locations" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              지점안내
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/booking"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              바로 예약하기
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="flex flex-col px-4 py-3 gap-1">
            <Link
              href="/cars"
              className="py-3 text-gray-700 font-medium border-b border-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              차량 둘러보기
            </Link>
            <Link
              href="/#how-it-works"
              className="py-3 text-gray-700 font-medium border-b border-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              이용방법
            </Link>
            <Link
              href="/#locations"
              className="py-3 text-gray-700 font-medium border-b border-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              지점안내
            </Link>
            <Link
              href="/booking"
              className="mt-2 bg-blue-600 text-white py-3 rounded-lg text-center font-medium"
              onClick={() => setMenuOpen(false)}
            >
              바로 예약하기
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
