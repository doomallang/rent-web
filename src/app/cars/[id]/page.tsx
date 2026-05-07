import { cars } from "@/data/cars";
import { notFound } from "next/navigation";
import Link from "next/link";

const categoryLabel: Record<string, string> = {
  economy: "경형",
  compact: "준중형/중형",
  suv: "SUV",
  luxury: "럭셔리",
  van: "미니밴",
};

const fuelLabel: Record<string, string> = {
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

export function generateStaticParams() {
  return cars.map((car) => ({ id: car.id }));
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = cars.find((c) => c.id === id);
  if (!car) notFound();

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/cars"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          차량 목록으로
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* 차량 이미지 */}
          <div className={`h-72 md:h-96 bg-gradient-to-br ${carColors[car.id] ?? "from-blue-400 to-blue-600"} flex items-center justify-center relative`}>
            {!car.available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-gray-800 font-bold px-6 py-2 rounded-full text-lg">
                  현재 예약불가
                </span>
              </div>
            )}
            <svg className="w-64 h-40 text-white/80" fill="currentColor" viewBox="0 0 100 50">
              <path d="M10,35 L15,20 Q20,10 35,10 L65,10 Q75,10 82,18 L90,28 L92,35 Q92,40 87,40 L80,40 Q78,45 70,45 Q62,45 60,40 L40,40 Q38,45 30,45 Q22,45 20,40 L13,40 Q8,40 8,35 Z" />
              <circle cx="30" cy="40" r="7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
              <circle cx="70" cy="40" r="7" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
            </svg>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                    {categoryLabel[car.category]}
                  </span>
                  <span className="text-xs text-gray-400">{car.year}년형</span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">
                  {car.brand} {car.name}
                </h1>
                <p className="text-gray-500 mt-2">{car.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-gray-400">1일 요금</p>
                <p className="text-4xl font-extrabold text-blue-600">
                  {car.pricePerDay.toLocaleString()}
                  <span className="text-lg font-normal text-gray-500">원</span>
                </p>
              </div>
            </div>

            {/* 스펙 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "탑승 인원", value: `${car.seats}인승` },
                { label: "변속기", value: car.transmission === "auto" ? "자동" : "수동" },
                { label: "연료", value: fuelLabel[car.fuelType] },
                { label: "연식", value: `${car.year}년` },
              ].map((spec) => (
                <div key={spec.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">{spec.label}</p>
                  <p className="font-bold text-gray-900">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* 주요 편의사양 */}
            <div className="mb-8">
              <h2 className="font-bold text-gray-900 mb-4">주요 편의사양</h2>
              <div className="flex flex-wrap gap-2">
                {car.features.map((feature) => (
                  <span
                    key={feature}
                    className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* 예약 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3">
              {car.available ? (
                <Link
                  href={`/booking?carId=${car.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg text-center transition-colors"
                >
                  지금 예약하기
                </Link>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-gray-200 text-gray-400 py-4 rounded-xl font-bold text-lg cursor-not-allowed"
                >
                  현재 예약불가
                </button>
              )}
              <Link
                href="/cars"
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-4 rounded-xl font-bold text-lg text-center transition-colors"
              >
                다른 차량 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
