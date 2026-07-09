"use server";

import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface PetSearchResult {
  name: string;
  type: "pet" | "san" | "chuong";
  count: number;
}

export async function searchPetAction(query: string): Promise<PetSearchResult[]> {
  try {
    if (!query || query.trim().length < 1) return [];

    const q = `%${query.trim()}%`;
    const lowerQuery = query.trim().toLowerCase();

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT DISTINCT p.id, p.title, p.pet_tim, p.san_tim, p.chuong
       FROM products p
        WHERE p.status = 'available'
          AND (p.pet_tim LIKE ? OR p.san_tim LIKE ? OR p.chuong LIKE ?)
       ORDER BY p.id DESC
       LIMIT 30`,
      [q, q, q]
    );

    const petMap = new Map<string, { type: PetSearchResult["type"]; productIds: Set<number> }>();

    for (const row of rows) {
      // Match pet_tim
      if (row.pet_tim) {
        const names = row.pet_tim.split(',').map((s: string) => s.trim()).filter(Boolean);
        for (const name of names) {
          if (name.toLowerCase().includes(lowerQuery)) {
            if (!petMap.has(name)) petMap.set(name, { type: "pet", productIds: new Set() });
            petMap.get(name)!.productIds.add(row.id);
          }
        }
      }

      // Match san_tim
      if (row.san_tim) {
        const names = row.san_tim.split(',').map((s: string) => s.trim()).filter(Boolean);
        for (const name of names) {
          if (name.toLowerCase().includes(lowerQuery)) {
            if (!petMap.has(name)) petMap.set(name, { type: "san", productIds: new Set() });
            petMap.get(name)!.productIds.add(row.id);
          }
        }
      }

      // Match chuong
      if (row.chuong) {
        const names = row.chuong.split(',').map((s: string) => s.trim()).filter(Boolean);
        for (const name of names) {
          if (name.toLowerCase().includes(lowerQuery)) {
            if (!petMap.has(name)) petMap.set(name, { type: "chuong", productIds: new Set() });
            petMap.get(name)!.productIds.add(row.id);
          }
        }
      }
    }

    const results: PetSearchResult[] = [];
    for (const [name, info] of petMap) {
      results.push({
        name,
        type: info.type,
        count: info.productIds.size,
      });
    }

    return results;
  } catch (error) {
    console.error("Search pet error:", error);
    return [];
  }
}
