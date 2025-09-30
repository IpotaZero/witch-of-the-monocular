import { Item } from "./Item"

export class LocalStorage {
    static getChapter(): number {
        const c = localStorage.getItem("chapter")
        return c ? JSON.parse(c) : 0
    }

    static setChapter(chapter: number) {
        localStorage.setItem("chapter", `${chapter}`)
    }

    static getCurrentBranch(): string[] {
        const c = localStorage.getItem("current-branch")
        return c ? JSON.parse(c) : []
    }

    static setCurrentBranch(branch: string[]) {
        localStorage.setItem("current-branch", JSON.stringify(branch))
    }

    static addBranch(p: string) {
        const c = this.getCurrentBranch()
        c.push(p)
        this.setCurrentBranch(c)
    }

    static getItems(): Item[] {
        const items = localStorage.getItem("items")
        return items ? JSON.parse(items) : []
    }

    static setItems(items: Item[]) {
        localStorage.setItem("items", JSON.stringify(items))
    }

    static removeItem(item: Item) {
        const i = this.getItems()
        this.setItems(i.filter((i) => i !== item))
    }

    static addItem(item: Item) {
        const items = this.getItems()
        if (!items.includes(item)) {
            items.push(item)
            this.setItems(items)
        }
    }

    static getFlags(): Flag[] {
        const items = localStorage.getItem("flags")
        return items ? JSON.parse(items) : []
    }

    static setFlags(items: Flag[]) {
        localStorage.setItem("flags", JSON.stringify(items))
    }

    static addFlag(item: Flag) {
        const items = this.getFlags()
        items.push(item)
        this.setFlags(items)
    }

    static addClearedStageId(id: Item) {
        const c = this.getClearedStageId()
        if (!c.includes(id)) {
            c.push(id)
            localStorage.setItem("cleared-stages", JSON.stringify(c))
        }
    }

    static getClearedStageId(): Item[] {
        const c = localStorage.getItem("cleared-stages")
        return c ? JSON.parse(c) : []
    }

    static getVolume(): { bgm: number; se: number } {
        const c = localStorage.getItem("volume")

        if (!c) {
            return {
                bgm: 9,
                se: 9,
            }
        }

        return JSON.parse(c)
    }

    static setVolume(v: { bgm: number; se: number }) {
        localStorage.setItem("volume", JSON.stringify(v))
    }
}

type Flag =
    | "あらすじ"
    | "met"
    | "key-0"
    | "1st"
    | "ツタを切った"
    | "2階"
    | "寝室開放"
    | "お風呂"
    | "おトイレ"
    | "寝室"
    | "地下"
    | "土砂突破"
