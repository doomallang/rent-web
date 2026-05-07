import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const bookings = await prisma.booking.findMany({
    where: {
      carId: id,
      status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
      returnDate: { gte: new Date() },
    },
    select: { pickupDate: true, returnDate: true },
    orderBy: { pickupDate: "asc" },
  });

  return NextResponse.json(
    bookings.map((b) => ({
      start: b.pickupDate.toISOString().slice(0, 10),
      end: b.returnDate.toISOString().slice(0, 10),
    }))
  );
}
