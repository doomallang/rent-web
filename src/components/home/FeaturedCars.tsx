import Link from "next/link";
import { cars, companies } from "@/data/cars";
import CarCard from "@/components/cars/CarCard";

export default function FeaturedCars() {
  const featured = cars.filter((c) => c.available).slice(0, 4);
  const companyMap = Object.fromEntries(companies.map((c) => [c.id, c]));

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-1">
              인기 차량
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              지금 바로 예약 가능한 차량
            </h2>
          </div>
          <Link
            href="/cars"
            className="hidden sm:flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            전체 보기
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((car) => (
            <CarCard key={car.id} car={car} company={companyMap[car.companyId]} />
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link href="/cars" className="inline-flex items-center gap-1 text-blue-600 font-medium">
            전체 차량 보기
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
