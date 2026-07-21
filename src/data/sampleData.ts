import type { HaneriItem, KimonoItem, ObiageItem, ObiItem, ObijimeItem } from "#src/types/kimono";

/**
 * サンプル着物データ
 * アプリケーションのデモ用に使用される着物の一覧
 */
export const sampleKimonos: KimonoItem[] = [
  { id: "kimono-1", name: "紅色", color: "#C41E3A" },
  { id: "kimono-2", name: "藍色", color: "#264348" },
  { id: "kimono-3", name: "若草色", color: "#8DB255" },
  { id: "kimono-4", name: "山吹色", color: "#F8B500" },
  { id: "kimono-5", name: "藤色", color: "#A388C4" },
];

/**
 * サンプル帯データ
 * アプリケーションのデモ用に使用される帯の一覧
 */
export const sampleObis: ObiItem[] = [
  { id: "obi-1", name: "金色", color: "#C9A84C" },
  { id: "obi-2", name: "銀色", color: "#A0A0A0" },
  { id: "obi-3", name: "朱色", color: "#E24D3D" },
  { id: "obi-4", name: "深緑", color: "#004D40" },
  { id: "obi-5", name: "紫紺", color: "#460E44" },
];

/**
 * サンプル半襟データ
 * アプリケーションのデモ用に使用される半襟の一覧
 */
export const sampleHaneris: HaneriItem[] = [
  { id: "haneri-1", name: "白", color: "#FBF7F0" },
  { id: "haneri-2", name: "生成り", color: "#EDE3D0" },
  { id: "haneri-3", name: "桜色", color: "#F4C2C8" },
  { id: "haneri-4", name: "水浅葱", color: "#8FC5C0" },
  { id: "haneri-5", name: "金", color: "#D4AF37" },
];

/**
 * サンプル帯揚げデータ
 * アプリケーションのデモ用に使用される帯揚げの一覧
 */
export const sampleObiages: ObiageItem[] = [
  { id: "obiage-1", name: "白", color: "#F7F4EF" },
  { id: "obiage-2", name: "絞りの赤", color: "#D9455F" },
  { id: "obiage-3", name: "水色", color: "#8FC1D4" },
  { id: "obiage-4", name: "藤色", color: "#B79FCB" },
  { id: "obiage-5", name: "若草", color: "#A8C97F" },
];

/**
 * サンプル帯締めデータ
 * アプリケーションのデモ用に使用される帯締めの一覧
 */
export const sampleObijimes: ObijimeItem[] = [
  { id: "obijime-1", name: "赤", color: "#C41E3A" },
  { id: "obijime-2", name: "白", color: "#F5F5F5" },
  { id: "obijime-3", name: "金", color: "#D4AF37" },
  { id: "obijime-4", name: "紫", color: "#7B287D" },
  { id: "obijime-5", name: "黒", color: "#1A1A1A" },
];
