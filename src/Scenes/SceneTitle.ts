import { Dom } from "../Dom"
import { Pages } from "../utils/Pages"
import { Scene } from "./Scene"
import { Scenes } from "./Scenes"

export class SceneTitle extends Scene {
    ready: Promise<void>
    #pages = new Pages()

    constructor() {
        super()
        this.ready = this.#setup()
    }

    async #setup() {
        const html = await (await fetch("pages/title.html")).text()
        await this.#pages.load(Dom.container, html)

        this.#pages.on("start", async () => {
            const { SceneAdventure } = await import("./SceneAdventure")
            await Scenes.goto(() => new SceneAdventure(), { msIn: 400, msOut: 800 })
        })
    }
}
