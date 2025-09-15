import { Dom } from "../Dom"
import { LocalStorage } from "../LocalStorage"
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
            // @ts-ignore
            const modules = import.meta.glob("./SceneAdventure*")

            const url = `./SceneAdventure${LocalStorage.getChapter()}.ts`

            const { SceneAdventure } = await modules[url]()
            await Scenes.goto(() => new SceneAdventure(), { msIn: 400, msOut: 800 })
        })

        const past = this.#pages.pages.get("past")!
        LocalStorage.getClearedStageId().forEach((id) => {
            past.innerHTML += `<button>${id}</button>`
        })
    }
}
