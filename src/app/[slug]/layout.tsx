import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CompanyHeader from "@/components/layout/CompanyHeader";
import CompanyFooter from "@/components/layout/CompanyFooter";
import { Company } from "@/types";

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) notFound();

  return (
    <>
      <CompanyHeader company={company as unknown as Company} />
      <main className="flex-1">{children}</main>
      <CompanyFooter company={company as unknown as Company} />
    </>
  );
}
