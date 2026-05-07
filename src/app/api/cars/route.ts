import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const slug = searchParams.get("slug");
  const pickupDate = searchParams.get("pickupDate");
  const returnDate = searchParams.get("returnDate");

  let resolvedCompanyId = companyId;
  if (!resolvedCompanyId && slug) {
    const company = await prisma.company.findUnique({ where: { slug } });
    resolvedCompanyId = company?.id ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = resolvedCompanyId ? { companyId: resolvedCompanyId } : {};

  if (pickupDate && returnDate) {
    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const booked = await prisma.booking.findMany({
      where: {
        carId: { not: null },
        status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
        pickupDate: { lt: returnD },
        returnDate: { gt: pickup },
      },
      select: { carId: true },
    });
    const bookedIds = booked.map((b) => b.carId).filter(Boolean) as string[];
    if (bookedIds.length > 0) where.id = { notIn: bookedIds };
  }

  const cars = await prisma.car.findMany({
    where,
    include: { company: true, location: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(cars);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { companyId, name, brand, category, year, seats, transmission, fuelType, pricePerDay, weekendPrice, holidayPrice, features, description, imageUrl, images, locationId, available } = body;

  if (!companyId || !name) return NextResponse.json({ error: "companyId, name은 필수입니다." }, { status: 400 });

  const imageArr: string[] = images ?? (imageUrl ? [imageUrl] : []);
  const car = await prisma.car.create({
    data: { companyId, name, brand, category, year, seats, transmission, fuelType, pricePerDay, weekendPrice: weekendPrice ?? null, holidayPrice: holidayPrice ?? null, features: features ?? [], description, imageUrl: imageArr[0] ?? null, images: imageArr, locationId: locationId ?? null, available },
    include: { company: true, location: true },
  });
  return NextResponse.json(car, { status: 201 });
}
