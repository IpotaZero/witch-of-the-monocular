import { Dom } from "../Dom"
import { LocalStorage } from "../LocalStorage"
import { Pages } from "../utils/Pages"
import { Serif } from "../utils/Serif"
import { Scene } from "./Scene"
import { Scenes } from "./Scenes"

export class SceneAdventure extends Scene {
    ready: Promise<void>

    #pages = new Pages()

    constructor() {
        super()
        this.ready = this.#setup()
    }

    async end(): Promise<void> {
        LocalStorage.setCurrentBranch(this.#pages.currentBranch.slice(0, -2))
    }

    async #setup() {
        this.#pages.on("item-0", (page) => {
            Serif.say("どうやらこの家の物には盗難防止の魔法が掛かっているようだ。<br>魔法を解いて手に入れる?")
            Serif.show()
        })

        this.#pages.on("item-get-0", async (page) => {
            const { SceneGame } = await import("./SceneGame")
            await Scenes.goto(() => new SceneGame(0), { mode: "fade" })
        })

        this.#pages.on("clear-0", async (page) => {
            LocalStorage.addItem("item-0")
            this.#update()
            page.back(2, { msIn: 0, msOut: 0 })
        })

        this.#pages.before("room-1", (page) => {
            if (LocalStorage.getItems().includes("item-0")) {
                return false
            } else {
                Serif.say("鍵がかかっている。")
                Serif.show()
                return true
            }
        })

        this.#pages.before(".*", () => {
            Serif.hide()
        })

        const html = await (await fetch("pages/adventure.html")).text()
        await this.#pages.load(Dom.container, html, { history: LocalStorage.getCurrentBranch() })

        // Dom.container.querySelector<HTMLElement>("#back")!.onclick = () => {
        //     this.#pages.back(1)
        // }

        this.#update()
    }

    #update() {
        Dom.container
            .querySelector<HTMLElement>('[data-link="item-0"]')!
            .classList.toggle("hidden", LocalStorage.getItems().includes("item-0"))
    }
}
