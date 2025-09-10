import { Awaits } from "../utils/Awaits.js"
import { Scene } from "./Scene.js"

export class Scenes {
    static #currentScene: Scene

    static init(firstScene: Scene) {
        this.#currentScene = firstScene
    }

    static async goto(
        newScene: () => Scene,
        {
            showLoading = this.#showLoading,
            hideLoading = this.#hideLoading,
            msIn = 800,
            msOut = 800,
            mode = "scale",
        }: {
            showLoading?: () => void
            hideLoading?: () => void
            msIn?: number
            msOut?: number
            mode?: "scale" | "fade"
        } = {},
    ) {
        const container = document.getElementById("container")!

        await this.#fadeOut(container, msIn, mode)
        await this.#currentScene.end()

        let done = false
        let showed = false

        // 1秒タイマーを並行実行
        Awaits.sleep(1000).then(() => {
            if (!done) {
                showLoading() // ローディング画面表示
                showed = true
            }
        })

        this.#currentScene = newScene()
        await this.#currentScene.ready // メイン処理実行
        done = true // 1秒以内に終わればローディングは表示されない

        if (showed) {
            hideLoading()
        }

        await this.#fadeIn(container, msOut, mode)
    }

    static async #fadeOut(container: HTMLElement, msIn: number, mode: "scale" | "fade") {
        if (msIn > 0) {
            if (mode === "scale") {
                await Awaits.exit(container, msIn)
            } else if (mode === "fade") {
                await Awaits.fadeOut(container, msIn)
            }
        }
    }

    static async #fadeIn(container: HTMLElement, msOut: number, mode: "scale" | "fade") {
        if (msOut > 0) {
            if (mode === "scale") {
                await Awaits.enter(container, msOut)
            } else if (mode === "fade") {
                await Awaits.fadeIn(container, msOut)
            }
        }
    }

    static #showLoading() {
        const p = document.createElement("p")
        p.textContent = "Loading..."
        p.classList.add("loading")
        document.body.appendChild(p)
    }

    static #hideLoading() {
        document.querySelectorAll(".loading").forEach((e) => e.remove())
    }
}
