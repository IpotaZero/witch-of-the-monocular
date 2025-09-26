export const getItem0 = ["1階のカギ", "包丁", "ライター", "空のバケツ"] as const
export const item0 = [...getItem0, "水の入ったバケツ"] as const
export const getItem1 = ["ぬるついたハンマー", "ヘアピン", "魔導書", "薄い本"] as const
export const item1 = [...getItem1, "ハンマー"] as const
export const getItem2 = [] as const
export const item2 = [...getItem2] as const

export type GetItem0 = (typeof getItem0)[number]
export type Item0 = (typeof item0)[number]
export type GetItem1 = (typeof getItem1)[number]
export type Item1 = (typeof item1)[number]
export type GetItem2 = (typeof getItem2)[number]
export type Item2 = (typeof item2)[number]

export type Item = Item0 | Item1 | Item2

export const itemMap: Record<Item, string> = {
    "1階のカギ": "(玄関のすぐ奥の扉の鍵。......2重扉?)",
    "包丁": "(軽くて扱いやすい包丁。)",
    "ライター": "(よくあるライター。オイルは十分)",
    "空のバケツ": "(何の変哲もないバケツ。)",
    "水の入ったバケツ": "(水の入ったバケツ。地味に重い。)",
    "ぬるついたハンマー": "(滑って使えそうにない。)",
    "ハンマー": "(鍵もブッ壊せそうなハンマー。)",
    "ヘアピン": "(技術があればピッキングできそう。)",
    "魔導書": "(物体を変質させる魔法が書いてある。)",
    "薄い本": "しばくぞ。",
}
