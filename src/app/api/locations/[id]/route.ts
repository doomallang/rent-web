import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, address, phone } = body;

  const location = await prisma.location.update({
    where: { id },
    data: { name, address, phone },
    include: { company: true },
  });
  return NextResponse.json(location);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.location.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
