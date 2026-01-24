import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS のクラス名をマージするユーティリティ関数
 * clsx と tailwind-merge を組み合わせて、重複するクラスを適切に処理する
 * @param inputs - マージするクラス名の配列
 * @returns マージされたクラス名の文字列
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
