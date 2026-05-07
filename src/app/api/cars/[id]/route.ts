import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await prisma.car.findUnique({ where: { id }, include: { company: true, location: true, pricingRules: { orderBy: { startDate: "asc" } } } });
  if (!car) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(car);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, brand, category, year, seats, transmission, fuelType, pricePerDay, features, description, available } = body;

  const body2 = { name, brand, category, year, seats, transmission, fuelType, pricePerDay, features, description, available };
  const { weekendPrice, holidayPrice, images, locationId } = body;
  const imageArr: string[] | undefined = images;
  const car = await prisma.car.update({
    where: { id },
    data: {
      ...Object.fromEntries(Object.entries(body2).filter(([, v]) => v !== undefined)),
      ...(weekendPrice !== undefined ? { weekendPrice: weekendPrice ?? null } : {}),
      ...(holidayPrice !== undefined ? { holidayPrice: holidayPrice ?? null } : {}),
      ...(imageArr !== undefined ? { images: imageArr, imageUrl: imageArr[0] ?? null } : {}),
      ...(locationId !== undefined ? { locationId: locationId ?? null } : {}),
    },
    include: { company: true, location: true },
  });
  return NextResponse.json(car);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.car.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
