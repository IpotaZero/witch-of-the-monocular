import { SE } from "../SE"

export class Serif {
    static #container: HTMLElement
    static #textArea: HTMLElement

    static #texts: string[] = []

    static #resolve: () => void = () => {}

    static wait() {
        return new Promise<void>((resolve) => {
            this.#resolve = resolve
        })
    }

    static init() {
        this.#container = document.createElement("div")
        this.#container.id = "serif-container"
        this.#container.classList.add("hidden")

        this.#textArea = document.createElement("div")
        this.#textArea.id = "serif"
        this.#textArea.classList.add("text-end", "fade-in", "hidden")

        this.#container.onclick = () => {
            this.#say()
        }

        window.addEventListener("keydown", (e) => {
            if (["KeyZ", "Enter", "Space"].includes(e.code)) {
                this.#say()
            }
        })

        this.#container.appendChild(this.#textArea)
        document.body.appendChild(this.#container)
    }

    static hide() {
        this.#container.classList.add("hidden")
    }

    static show() {
        this.#container.classList.remove("hidden")
        this.#textArea.classList.add("hidden")
    }

    static say(...text: string[]) {
        this.#texts = text
        this.#say()
        this.show()
    }

    static #say() {
        if (this.#texts.length === 0) {
            this.#container.classList.add("hidden")
            this.#resolve()
        } else {
            this.#textArea.classList.remove("fade-in")

            const t = this.#texts.shift() + ""

            if (t.endsWith(")")) {
            } else if (t.endsWith("!")) {
                SE.strong.play()
            } else if (t.endsWith("!?")) {
                SE.surprised.play()
            } else if (t.endsWith("?")) {
                SE.what.play()
            } else {
                SE.voice.play()
            }

            requestAnimationFrame(() => {
                this.#textArea.innerHTML = t
                this.#textArea.classList.add("fade-in")
                this.#textArea.classList.remove("hidden")
            })
        }
    }
}
