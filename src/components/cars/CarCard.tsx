import Link from "next/link";
import { Car } from "@/types";

const categoryLabel: Record<Car["category"], string> = {
  economy: "경형",
  compact: "준중형/중형",
  suv: "SUV",
  luxury: "럭셔리",
  van: "미니밴",
};

const fuelLabel: Record<Car["fuelType"], string> = {
  gasoline: "가솔린",
  diesel: "디젤",
  electric: "전기",
  hybrid: "하이브리드",
};

const carColors: Record<string, string> = {
  "1": "from-slate-400 to-slate-600",
  "2": "from-blue-400 to-blue-600",
  "3": "from-gray-500 to-gray-700",
  "4": "from-zinc-500 to-zinc-700",
  "5": "from-neutral-600 to-neutral-800",
  "6": "from-stone-400 to-stone-600",
  "7": "from-sky-400 to-sky-600",
  "8": "from-orange-300 to-orange-500",
};

export default function CarCard({ car }: { car: Car }) {
  return (
    <Link href={`/cars/${car.id}`} className="group block">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:-translate-y-1">
        <div className={`relative h-48 bg-gradient-to-br ${carColors[car.id] ?? "from-blue-400 to-blue-600"} flex items-center justify-center`}>
          {!car.available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="bg-white text-gray-800 font-bold px-4 py-1 rounded-full text-sm">
                예약불가
              </span>
            </div>
          )}
          <svg className="w-32 h-20 text-white/80" fill="currentColor" viewBox="0 0 100 50">
            <path d="M10,35 L15,20 Q20,10 35,10 L65,10 Q75,10 82,18 L90,28 L92,35 Q92,40 87,40 L80,40 Q78,45 70,45 Q62,45 60,40 L40,40 Q38,45 30,45 Q22,45 20,40 L13,40 Q8,40 8,35 Z" />
            <circle cx="30" cy="40" r="7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
            <circle cx="70" cy="40" r="7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          </svg>
          <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
            {categoryLabel[car.category]}
          </span>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-gray-400 font-medium">{car.brand}</p>
              <h3 className="font-bold text-gray-900 text-lg">{car.name}</h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">1일</p>
              <p className="font-bold text-blue-600 text-lg">
                {car.pricePerDay.toLocaleString()}원
              </p>
            </div>
          </div>

          <div className="flex gap-3 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {car.seats}인승
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              {car.transmission === "auto" ? "자동" : "수동"}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {fuelLabel[car.fuelType]}
            </span>
          </div>

          <button
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
              car.available
                ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {car.available ? "자세히 보기" : "예약불가"}
          </button>
        </div>
      </div>
    </Link>
  );
}
