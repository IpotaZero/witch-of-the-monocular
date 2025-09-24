import { Awaits } from "./Awaits"

type Handler = (pages: Pages) => void
type BeforeHandler = (pages: Pages) => Promise<boolean | void>

type FadeOption = Partial<{ msIn: number; msOut: number; back: boolean }>

export class Pages {
    defaultMSIn = 700
    defaultMSOut = 700

    readonly pages = new RegExpDict<HTMLElement>({})

    readonly #handlers = new RegExpDict<Handler>({})
    readonly #leftHandlers = new RegExpDict<Handler>({})
    readonly #beforeHandlers = new RegExpDict<BeforeHandler>({})

    #container!: HTMLElement
    #currentBranch: string[] = []

    #currentPageId = "絶対に存在しないページID"

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

    shaveBranch(num: number) {
        this.#currentBranch = this.#currentBranch.slice(0, -num)
    }

    getCurrentBranch() {
        return [...this.#currentBranch]
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
        Array.from(this.#container.querySelectorAll("button"))
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
        if (await this.#runBefore(id)) return
        this.#disableButtons()
        this.#runLeft(this.#currentPageId)

        const from = this.pages.get(this.#currentPageId)
        const to = this.pages.get(id)

        this.#currentPageId = id
        this.#currentBranch.push(id)

        await this.#fadeIn(msIn, from, to, back)

        this.#runOn(this.#currentPageId)
    }

    async #fadeIn(msIn: number, from: HTMLElement | undefined, to: HTMLElement | undefined, back: boolean) {
        to?.classList.remove("hidden")

        if (msIn > 0) {
            const fromLayerNum = Number(from?.getAttribute("data-layer")) || 0
            const toLayerNum = Number(to?.getAttribute("data-layer")) || 0

            if (fromLayerNum <= toLayerNum) {
                this.#fade(to, back, msIn, true)
            }

            if (fromLayerNum >= toLayerNum) {
                this.#fade(from, back, msIn, false)
            }

            await Awaits.sleep(msIn)

            if (fromLayerNum >= toLayerNum) {
                from?.classList.add("hidden")
            }
        }
    }

    #fade(page: HTMLElement | undefined, back: boolean, msIn: number, to: boolean) {
        if (to) {
            if (back) {
                page && Awaits.exitReverse(page, msIn)
            } else {
                page && Awaits.enter(page, msIn)
            }
        } else {
            if (back) {
                page && Awaits.enterReverse(page, msIn)
            } else {
                page && Awaits.exit(page, msIn)
            }
        }
    }

    async #runBefore(id: string) {
        const before = this.#beforeHandlers
            .getAll(id)
            .map((handler) => handler(this))
            .toArray()

        const p = await Promise.all(before)

        return p.some(Boolean)
    }

    #runLeft(id: string) {
        this.#leftHandlers.getAll(id).forEach((handler) => handler(this))
    }

    #runOn(id: string) {
        requestAnimationFrame(() => {
            this.#handlers.getAll(id).forEach((handler) => handler(this))
            this.#ableButtons()
        })
    }

    #disableButtons() {
        this.#container.style.pointerEvents = "none"

        this.pages.getValues().forEach((p) => (p.style.pointerEvents = "none"))

        this.pages.getValues().forEach((page) => page.querySelectorAll("button").forEach((b) => (b.disabled = true)))
    }

    #ableButtons() {
        this.pages
            .getValues()
            .filter((page) => !page.classList.contains("hidden"))
            .forEach((page) => page.querySelectorAll("button").forEach((b) => (b.disabled = false)))

        this.#container.style.pointerEvents = ""
        this.pages.getValues().forEach((p) => (p.style.pointerEvents = ""))
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
