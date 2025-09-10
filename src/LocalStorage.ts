export class LocalStorage {
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

    static getItems(): string[] {
        const items = localStorage.getItem("items")
        return items ? JSON.parse(items) : []
    }

    static setItems(items: string[]) {
        localStorage.setItem("items", JSON.stringify(items))
    }

    static addItem(item: string) {
        const items = this.getItems()
        items.push(item)
        this.setItems(items)
    }
}
