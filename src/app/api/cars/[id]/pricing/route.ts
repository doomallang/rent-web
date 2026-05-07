import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rules = await prisma.pricingRule.findMany({
    where: { carId: id },
    orderBy: { startDate: "asc" },
  });
  return NextResponse.json(rules);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { startDate, endDate, price, label } = body;

  if (!startDate || !endDate || price == null) {
    return NextResponse.json({ error: "startDate, endDate, price는 필수입니다." }, { status: 400 });
  }

  const rule = await prisma.pricingRule.create({
    data: {
      carId: id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      price,
      label: label ?? "",
    },
  });
  return NextResponse.json(rule, { status: 201 });
}
