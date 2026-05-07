import Link from "next/link";
import { companies } from "@/data/cars";

const colorMap: Record<string, string> = {
  blue: "bg-blue-600",
  sky: "bg-sky-500",
  green: "bg-green-600",
  purple: "bg-purple-600",
  orange: "bg-orange-500",
};

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white">드라이브온</h1>
        </div>
        <p className="text-gray-400 text-lg">렌트카 서비스 플랫폼</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/${company.slug}`}
            className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
          >
            <div className={`w-12 h-12 ${colorMap[company.color] ?? "bg-blue-600"} rounded-xl flex items-center justify-center text-white text-xl font-extrabold mb-4`}>
              {company.name[0]}
            </div>
            <h2 className="text-white font-bold text-lg mb-1">{company.name}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{company.description}</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium" style={{ color: company.primaryColor }}>
              사이트 방문
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/admin"
        className="text-gray-600 hover:text-gray-400 text-sm transition-colors flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        관리자 포털
      </Link>
    </div>
  );
}
