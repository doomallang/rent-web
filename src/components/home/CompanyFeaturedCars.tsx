import Link from "next/link";
import { Car, Company } from "@/types";
import CarCard from "@/components/cars/CarCard";

export default function CompanyFeaturedCars({ company, cars }: { company: Company; cars: Car[] }) {
  const featured = cars.filter((c) => c.available).slice(0, 4);

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="font-semibold text-sm uppercase tracking-wide mb-1" style={{ color: company.primaryColor }}>
              보유 차량
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">지금 예약 가능한 차량</h2>
          </div>
          <Link href={`/${company.slug}/cars`} className="hidden sm:flex items-center gap-1 font-medium hover:opacity-70 transition-opacity" style={{ color: company.primaryColor }}>
            전체 보기
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-gray-400 text-center py-10">현재 예약 가능한 차량이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((car) => (
              <CarCard key={car.id} car={car} company={company} slug={company.slug} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
