import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  const locations = await prisma.location.findMany({
    where: companyId ? { companyId } : undefined,
    include: { company: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(locations);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { companyId, name, address, phone } = body;

  if (!companyId || !name) {
    return NextResponse.json({ error: "companyId, name은 필수입니다." }, { status: 400 });
  }

  const location = await prisma.location.create({
    data: { companyId, name, address: address ?? "", phone: phone ?? "" },
    include: { company: true },
  });
  return NextResponse.json(location, { status: 201 });
}
