import { Item } from "./Item"

export class LocalStorage {
    private static readonly DATA_KEY = "wotm-data"

    private static getData(): Record<string, any> {
        const data = localStorage.getItem(this.DATA_KEY)
        return data ? JSON.parse(data) : {}
    }

    private static setData(data: Record<string, any>) {
        localStorage.setItem(this.DATA_KEY, JSON.stringify(data))
    }

    static getChapter(): number {
        const data = this.getData()
        return data.chapter ?? 0
    }

    static setChapter(chapter: number) {
        const data = this.getData()
        data.chapter = chapter
        this.setData(data)
    }

    static getCurrentBranch(): string[] {
        const data = this.getData()
        return data.currentBranch ?? []
    }

    static setCurrentBranch(branch: string[]) {
        const data = this.getData()
        data.currentBranch = branch
        this.setData(data)
    }

    static addBranch(p: string) {
        const c = this.getCurrentBranch()
        c.push(p)
        this.setCurrentBranch(c)
    }

    static getItems(): Item[] {
        const data = this.getData()
        return data.items ?? []
    }

    static setItems(items: Item[]) {
        const data = this.getData()
        data.items = items
        this.setData(data)
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
        const data = this.getData()
        return data.flags ?? []
    }

    static setFlags(items: Flag[]) {
        const data = this.getData()
        data.flags = items
        this.setData(data)
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
            const data = this.getData()
            data.clearedStages = c
            this.setData(data)
        }
    }

    static getClearedStageId(): Item[] {
        const data = this.getData()
        return data.clearedStages ?? []
    }

    static getVolume(): { bgm: number; se: number } {
        const data = this.getData()
        return data.volume ?? { bgm: 9, se: 9 }
    }

    static setVolume(v: { bgm: number; se: number }) {
        const data = this.getData()
        data.volume = v
        this.setData(data)
    }

    static set isCleared(isCleared: boolean) {
        const data = this.getData()
        data.isCleared = isCleared
        this.setData(data)
    }

    static get isCleared() {
        const data = this.getData()
        return data.isCleared ?? false
    }

    static clearAdventure() {
        const c = this.getData()
        delete c["flags"]
        delete c["items"]
        delete c["chapter"]
        delete c["currentBranch"]
        delete c["isCleared"]

        this.setData(c)
    }

    static clear() {
        localStorage.removeItem(this.DATA_KEY)
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
    | "魔女の部屋"
