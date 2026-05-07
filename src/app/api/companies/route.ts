import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  const companies = await prisma.company.findMany({
    where: slug ? { slug } : undefined,
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { cars: true, bookings: true } } },
  });
  return NextResponse.json(companies);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { slug, name, description, phone, color, primaryColor } = body;

  if (!name || !slug) return NextResponse.json({ error: "name, slug은 필수입니다." }, { status: 400 });

  const exists = await prisma.company.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ error: "이미 사용 중인 슬러그입니다." }, { status: 409 });

  const company = await prisma.company.create({ data: { slug, name, description, phone, color, primaryColor } });
  return NextResponse.json(company, { status: 201 });
}
