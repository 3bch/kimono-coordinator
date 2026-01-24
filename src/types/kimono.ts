/**
 * 着物アイテムを表すインターフェース
 */
export interface KimonoItem {
  /** 着物の一意な識別子 */
  id: string;
  /** 着物の名前（例: 紅色、藍色） */
  name: string;
  /** 着物の色（CSS カラーコード） */
  color: string;
}

/**
 * 帯アイテムを表すインターフェース
 */
export interface ObiItem {
  /** 帯の一意な識別子 */
  id: string;
  /** 帯の名前（例: 金色、銀色） */
  name: string;
  /** 帯の色（CSS カラーコード） */
  color: string;
}
