import { Awaits } from "../utils/Awaits"
import { Connector } from "./Connector"

export class Game {
    protected $defaultState: readonly number[] = []
    protected $vertices: HTMLElement[] = []
    protected $connectors: Map<Connector, [number, number]> = new Map()

    #state: number[] = []
    #vertexValueElements: HTMLElement[] = []

    #abort = new AbortController()

    onClear = () => {}

    constructor(container: Element) {
        this.$setupElement(container)
        container.appendChild(Connector.ensureLayer())

        // this.$connectors.forEach((_, c) => {
        //     c.line.style.animationDelay = `${Math.random() * 0.5}s`
        // })

        // this.#vertexValueElements.forEach((v) => {
        //     v.classList.add("hidden")
        // })

        this.reset()
        this.#setupValueElement(container)
        this.#setupEventListener()
    }

    reset() {
        this.#state = [...this.$defaultState]
        this.#updateLineClass()
        requestAnimationFrame(() => {
            this.#updateVertexPosition()
        })
    }

    destroy() {
        this.$connectors.forEach((_, c) => c.destroy())
        this.#vertexValueElements.forEach((v) => v.remove())
        this.#abort.abort()
    }

    protected $setupElement(container: Element) {}

    protected $createVertex(x: number, y: number, value: number) {
        const vertex = document.createElement("span")
        vertex.classList.add("vertex")

        vertex.style.left = `calc(50% + ${x}dvh)`
        vertex.style.top = `calc(50% + ${y}dvh)`
        vertex.style.setProperty("--value", value + "")

        vertex.innerHTML = `
            <input class="answer" type="text" readonly value="${value ? value : ""}">
        `

        return vertex
    }

    #setupValueElement(container: Element) {
        this.#vertexValueElements = this.$vertices.map((_, j) => {
            const i = document.createElement("input")
            i.classList.add("value")
            i.setAttribute("value", `${j ? j : ""}`)
            i.style.setProperty("--value", j + "")

            container.appendChild(i)

            return i
        })

        this.#updateVertexPosition()
    }

    #updateVertexPosition() {
        this.#vertexValueElements.forEach((i, j) => {
            const r = this.$vertices[this.#state.indexOf(j)].getBoundingClientRect()

            i.style.left = `${r.left + r.width / 2}px`
            i.style.top = `${r.top + r.height / 2}px`
        })
    }

    #setupEventListener() {
        this.$connectors.forEach(([i, j], c) => {
            c.hitLine.addEventListener("pointerover", () => {
                if (c.hitLine.classList.contains("available")) {
                    c.line.classList.add("hovered")
                    const n = this.#state[i] === 0 ? j : i
                    this.#vertexValueElements[this.#state[n]].classList.add("yurayura")
                }
            })

            c.hitLine.addEventListener("pointerleave", () => {
                c.line.classList.remove("hovered")
                this.#vertexValueElements.forEach((v) => v.classList.remove("yurayura"))
            })

            c.hitLine.addEventListener("click", () => {
                this.#onClick(i, j, c.options.arrow)
            })
        })

        window.addEventListener(
            "resize",
            () => {
                this.#vertexValueElements.forEach((e) => {
                    e.classList.add("imm")
                })

                requestAnimationFrame(() => {
                    this.#updateVertexPosition()
                    this.#vertexValueElements.forEach((e) => {
                        e.classList.remove("imm")
                    })
                })
            },
            { signal: this.#abort.signal },
        )
    }

    #updateLineClass() {
        const index = this.#state.indexOf(0)

        this.$connectors.forEach((arc, c) => {
            let isAvailable = arc.includes(index)

            if (c.options.arrow) {
                isAvailable = arc[0] === index
            }

            c.line.classList.toggle("available", isAvailable)
            c.hitLine.classList.toggle("available", isAvailable)

            if (isAvailable) {
                c.line.remove()
                c.hitLine.remove()

                Connector.ensureLayer().appendChild(c.line)
                Connector.ensureLayer().appendChild(c.hitLine)
            }
        })
    }

    #onClick(i: number, j: number, arrow: boolean) {
        const index = this.#state.indexOf(0)

        if (arrow) {
            if (index !== i) return
        } else {
            if (index !== i && index !== j) return
        }

        ;[this.#state[i], this.#state[j]] = [this.#state[j], this.#state[i]]

        if (this.#state.join() === this.#state.map((_, i) => i).join()) {
            this.onClear()
        }

        this.#updateLineClass()
        this.#updateVertexPosition()
    }
}
