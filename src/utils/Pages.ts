import { Awaits } from "./Awaits"

type Handler = (pages: Pages) => void
type BeforeHandler = (pages: Pages) => boolean | void

type FadeOption = Partial<{ msIn: number; msOut: number; back: boolean }>

export class Pages {
    defaultMSIn = 800
    defaultMSOut = 800

    readonly pages = new RegExpDict<HTMLElement>({})

    readonly #handlers = new RegExpDict<Handler>({})
    readonly #leftHandlers = new RegExpDict<Handler>({})
    readonly #beforeHandlers = new RegExpDict<BeforeHandler>({})

    #container!: HTMLElement
    #currentBranch: string[] = []

    #currentPageId = "first"

    async load(container: HTMLElement, html: string, { history }: { history?: string[] } = {}) {
        this.#container = container
        this.#container.innerHTML = html

        const first = history && history.length ? history.at(-1)! : "first"
        this.#currentBranch = history && history.length ? history.slice(0, -1) : []

        Array.from(container.querySelectorAll<HTMLElement>(".page")).forEach((page) => {
            this.pages.add(page.id, page)

            if (page.id !== first) page.classList.add("hidden")
        })

        await this.goto(first, { msIn: 0, msOut: 0 })
        this.updateButtons()
    }

    get currentBranch() {
        return this.#currentBranch
    }

    set currentBranch(branch: string[]) {
        if (branch.length === 0) return

        this.#currentBranch = branch.slice(0, -1)
        this.goto(branch.at(-1)!)
    }

    on(selector: string, handler: Handler) {
        this.#handlers.add(selector, handler)
    }

    onLeft(selector: string, handler: Handler) {
        this.#leftHandlers.add(selector, handler)
    }

    before(selector: string, handler: BeforeHandler) {
        this.#beforeHandlers.add(selector, handler)
    }

    onSubmit(selector: string, handler: (value: string) => void) {
        const page = this.pages.get(selector)

        if (!page) throw new Error("そんなページはない")

        const form = page.querySelector("form")
        const input = page.querySelector("input")

        if (!form || !input) throw new Error("そんなformはない")

        form.onsubmit = (e) => {
            e.preventDefault()
            handler(input.value)
        }
    }

    updateButtons() {
        this.pages.getValues().forEach((page) => {
            ;[...page.querySelectorAll("button")]
                .filter((b) => !b.classList.contains("non-page"))
                .forEach((button, i) => {
                    let msIn: number

                    if (button.hasAttribute("data-ms-in")) {
                        msIn = Number(button.getAttribute("data-ms-in"))
                    }

                    button.onclick = () => {
                        this.goto(button.dataset["link"]!, {
                            msIn,
                            back: button.classList.contains("back"),
                        })
                    }

                    const back = button.getAttribute("data-back")

                    if (back) {
                        button.onclick = () => {
                            this.back(Number(back), { msIn })
                        }
                    }
                })
        })
    }

    async back(backDepth: number, { msIn, msOut }: FadeOption = {}) {
        for (let i = 0; i < backDepth; i++) {
            this.#back({
                msIn: msIn,
                msOut: msOut,
                back: true,
            })
        }
    }

    #back(option: FadeOption) {
        if (this.#currentBranch.length <= 0) return
        this.#currentBranch.pop()
        this.goto(this.#currentBranch.pop()!, option)
    }

    async goto(id: string, { msIn = this.defaultMSIn, msOut = this.defaultMSOut, back = false }: FadeOption = {}) {
        if (this.#beforeHandlers.getAll(id).some((handler) => handler(this))) return

        this.#disableButtons()

        this.#leftHandlers.getAll(this.#currentPageId).forEach((handler) => handler(this))

        const from = this.pages.get(this.#currentPageId)
        const to = this.pages.get(id)

        this.#currentPageId = id
        this.#currentBranch.push(id)

        to?.classList.remove("hidden")

        if (msIn > 0) {
            if (back) {
                to && Awaits.exitReverse(to, msIn)
                from && Awaits.enterReverse(from, msIn)
            } else {
                to && Awaits.enter(to, msIn)
                from && Awaits.exit(from, msIn)
            }

            await Awaits.sleep(msIn)
        }

        requestAnimationFrame(() => {
            this.#handlers.getAll(this.#currentPageId).forEach((handler) => handler(this))
            this.#ableButtons()
        })

        if (from !== to) {
            from?.classList.add("hidden")
        }
    }

    #disableButtons() {
        this.pages.getValues().forEach((page) => page.querySelectorAll("button").forEach((b) => (b.disabled = true)))
    }

    #ableButtons() {
        this.pages
            .getValues()
            .filter((page) => !page.classList.contains("hidden"))
            .forEach((page) => page.querySelectorAll("button").forEach((b) => (b.disabled = false)))
    }
}

export class RegExpDict<T> {
    readonly #dict: Record<string, T>

    constructor(dict: Record<string, T>) {
        this.#dict = dict
    }

    get(key: string): T | undefined {
        for (const [reg, value] of Object.entries(this.#dict)) {
            if (new RegExp(`^${reg}$`).test(key)) {
                return value
            }
        }
    }

    *getAll(key: string): Generator<T, undefined, unknown> {
        for (const [reg, value] of Object.entries(this.#dict)) {
            if (new RegExp(`^${reg}$`).test(key)) {
                yield value
            }
        }
    }

    getKeys(): string[] {
        return Object.keys(this.#dict)
    }

    getValues(): T[] {
        return Object.values(this.#dict)
    }

    add(reg: string, value: T) {
        this.#dict[reg] = value
    }
}
