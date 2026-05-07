import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "jpg, png, webp, gif만 업로드 가능합니다." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다." }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  await writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
