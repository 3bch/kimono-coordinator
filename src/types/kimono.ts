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

/**
 * 半襟アイテムを表すインターフェース
 */
export interface HaneriItem {
  /** 半襟の一意な識別子 */
  id: string;
  /** 半襟の名前（例: 白、桜色） */
  name: string;
  /** 半襟の色（CSS カラーコード） */
  color: string;
}

/**
 * 帯揚げアイテムを表すインターフェース
 */
export interface ObiageItem {
  /** 帯揚げの一意な識別子 */
  id: string;
  /** 帯揚げの名前（例: 白、絞りの赤） */
  name: string;
  /** 帯揚げの色（CSS カラーコード） */
  color: string;
}

/**
 * 帯締めアイテムを表すインターフェース
 */
export interface ObijimeItem {
  /** 帯締めの一意な識別子 */
  id: string;
  /** 帯締めの名前（例: 赤、白） */
  name: string;
  /** 帯締めの色（CSS カラーコード） */
  color: string;
}

/**
 * 帯留めアイテムを表すインターフェース
 */
export interface ObidomeItem {
  /** 帯留めの一意な識別子 */
  id: string;
  /** 帯留めの名前（例: 白、銀杏） */
  name: string;
  /** 帯留めの色（CSS カラーコード、インジケーターと単色描画に使用） */
  color: string;
  /** 帯留めの画像 URL（指定時は単色の四角の代わりに画像で描画） */
  imageUrl?: string;
}
