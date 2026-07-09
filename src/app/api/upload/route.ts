import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file ảnh" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const filename = `${randomUUID()}.webp`;
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });

    let optimized: Buffer;
    try {
      optimized = await sharp(buffer)
        .resize(800, 800, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    } catch {
      optimized = await sharp(buffer).webp({ quality: 80 }).toBuffer();
    }

    await writeFile(filePath, optimized);

    return NextResponse.json({
      success: true,
      url: `/api/images/${filename}`,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Lỗi tải ảnh lên: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
