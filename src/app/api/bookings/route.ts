import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = companyId ? { companyId } : {};
  if (dateFrom && dateTo) {
    // 선택 기간과 겹치는 모든 예약 (픽업일이 기간 내이거나, 반납일이 기간 내이거나, 기간을 포함하는 예약)
    where.pickupDate = { lte: new Date(dateTo) };
    where.returnDate = { gte: new Date(dateFrom) };
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: { car: true, company: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    carId, companyId, customerName, customerPhone, customerEmail,
    driverLicense, pickupLocation, returnLocation, pickupDate, returnDate, totalPrice, requests, status,
  } = body;

  if (!carId || !companyId || !customerName) {
    return NextResponse.json({ error: "carId, companyId, customerName은 필수입니다." }, { status: 400 });
  }

  const pickup = new Date(pickupDate);
  const returnD = new Date(returnDate);

  // 날짜 범위가 겹치는 활성 예약 확인 (취소·완료 제외)
  const conflict = await prisma.booking.findFirst({
    where: {
      carId,
      status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      pickupDate: { lt: returnD },
      returnDate: { gt: pickup },
    },
  });

  if (conflict) {
    return NextResponse.json(
      { error: `선택하신 기간(${pickupDate} ~ ${returnDate})에 이미 예약이 있습니다. 다른 날짜를 선택해주세요.` },
      { status: 409 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      carId, companyId, customerName, customerPhone, customerEmail,
      driverLicense: driverLicense ?? "",
      pickupLocation, returnLocation,
      pickupDate: new Date(pickupDate),
      returnDate: new Date(returnDate),
      totalPrice,
      requests: requests ?? "",
      ...(status ? { status } : {}),
    },
    include: { car: true, company: true },
  });
  return NextResponse.json(booking, { status: 201 });
}
