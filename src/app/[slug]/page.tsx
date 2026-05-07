import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CompanyHero from "@/components/home/CompanyHero";
import CompanyFeaturedCars from "@/components/home/CompanyFeaturedCars";
import HowItWorks from "@/components/home/HowItWorks";
import Stats from "@/components/home/Stats";
import { Car, Company } from "@/types";

export default async function CompanyHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) notFound();

  const companyCars = await prisma.car.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <CompanyHero company={company as unknown as Company} />
      <CompanyFeaturedCars company={company as unknown as Company} cars={companyCars as unknown as Car[]} />
      <Stats />
      <HowItWorks />
    </>
  );
}
