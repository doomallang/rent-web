import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { slug, name, description, phone, color, primaryColor } = body;

  if (slug) {
    const conflict = await prisma.company.findFirst({ where: { slug, NOT: { id } } });
    if (conflict) return NextResponse.json({ error: "이미 사용 중인 슬러그입니다." }, { status: 409 });
  }

  const company = await prisma.company.update({
    where: { id },
    data: { slug, name, description, phone, color, primaryColor },
  });
  return NextResponse.json(company);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
