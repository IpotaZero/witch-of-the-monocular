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
        this.#textArea.classList.add("fade-in", "hidden")

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

            if (!t.endsWith(")")) {
                this.#textArea.innerHTML = `<img src="assets/images/icon.png" align="top" />`
            } else {
                this.#textArea.innerHTML = ""
                SE.say.play()
            }

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
                this.#textArea.innerHTML += `<div class="text-area text-end">${t}</div>`
                this.#textArea.classList.add("fade-in")
                this.#textArea.classList.remove("hidden")
            })
        }
    }
}

export class Ask {
    static #container: HTMLElement
    static #textArea: HTMLElement

    static init() {
        this.#container = document.createElement("div")
        this.#container.id = "serif-container"
        this.#container.classList.add("hidden")

        this.#textArea = document.createElement("div")
        this.#textArea.id = "ask"
        this.#textArea.classList.add("fade-in")

        this.#container.appendChild(this.#textArea)
        document.body.appendChild(this.#container)
    }

    static hide() {
        this.#container.classList.add("hidden")
    }

    static show() {
        this.#container.classList.remove("hidden")
    }

    static ask(options: readonly string[]) {
        this.show()

        this.#textArea.innerHTML = ""

        const buttons = options.map((text) => {
            const b = document.createElement("button")
            b.textContent = text
            b.classList.add("question-button")
            this.#textArea.appendChild(b)

            return b
        })

        return new Promise<(typeof options)[number]>((resolve) => {
            buttons.forEach((b, i) => {
                b.onclick = () => {
                    resolve(options[i])
                    this.hide()
                }
            })
        })
    }
}
