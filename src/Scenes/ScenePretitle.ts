import { Dom } from "../Dom"
import { Awaits } from "../utils/Awaits"
import { Pages } from "../utils/Pages"
import { Scene } from "./Scene"
import { Scenes } from "./Scenes"

export class ScenePretitle extends Scene {
    ready: Promise<void>

    #pages = new Pages()

    constructor() {
        super()

        this.ready = this.#setup()
    }

    async #setup() {
        const html = await (await fetch("pages/pretitle.html")).text()
        await this.#pages.load(Dom.container, html)

        this.#start()
    }

    async #start() {
        await Awaits.ok()

        const { SceneTitle } = await import("./SceneTitle")

        await Scenes.goto(() => new SceneTitle())
    }
}
