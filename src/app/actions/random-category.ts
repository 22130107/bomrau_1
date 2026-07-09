"use server";

import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  description: string;
}

export interface RandomCategoryResult {
  categories: CategoryInfo[];
  selected: CategoryInfo;
}

export async function spinRandomAction() {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, slug, image_url, description FROM categories WHERE is_active = 1 ORDER BY sort_order ASC"
  );

  const categories = rows.map(r => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    image_url: r.image_url || "",
    description: r.description || "",
  }));

  if (categories.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * categories.length);

  return {
    categories,
    selected: categories[randomIndex],
  };
}
