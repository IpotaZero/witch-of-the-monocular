export class Serif {
    static textArea: HTMLElement

    static init() {
        this.textArea = document.createElement("div")
        this.textArea.id = "serif"
        this.textArea.classList.add("hidden", "fade-in", "text-end")

        this.textArea.onclick = () => {
            this.hide()
        }

        document.body.appendChild(this.textArea)
    }

    static hide() {
        this.textArea.classList.add("hidden")
    }

    static show() {
        this.textArea.classList.remove("hidden")
    }

    static say(text: string) {
        this.textArea.innerHTML = text
    }
}
