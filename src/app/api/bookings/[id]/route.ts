import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  const booking = await prisma.booking.update({
    where: { id },
    data: { status },
    include: { car: true, company: true },
  });
  return NextResponse.json(booking);
}
