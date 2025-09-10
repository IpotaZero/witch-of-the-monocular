import { Dom } from "../Dom"
import { Game } from "../Games/Game"
import { LocalStorage } from "../LocalStorage"
import { Pages } from "../utils/Pages"
import { Scene } from "./Scene"
import { Scenes } from "./Scenes"

export class SceneGame extends Scene {
    ready: Promise<void>

    #pages = new Pages()
    #game!: Game

    constructor(id: number) {
        super()

        this.ready = this.#setup(id)
    }

    async end(): Promise<void> {
        this.#game.destroy()
    }

    async #setup(id: number) {
        const html = await (await fetch("pages/game.html")).text()
        await this.#pages.load(Dom.container, html)

        this.#pages.on("back", async () => {
            const { SceneAdventure } = await import("./SceneAdventure")
            await Scenes.goto(() => new SceneAdventure())
        })

        this.#pages.on("retry", async (page) => {
            page.back(1, { msIn: 0, msOut: 0 })
            this.#game.reset()
        })

        this.#pages.on("clear", async (page) => {
            LocalStorage.addBranch(`clear-${id}`)

            const { SceneAdventure } = await import("./SceneAdventure")
            await Scenes.goto(() => new SceneAdventure())
        })

        this.#start(id)
    }

    async #start(id: number) {
        // @ts-ignore
        const modules = import.meta.glob("../Stages/*")

        const url = `../Stages/Stage${id}.ts`

        const { Stage } = await modules[url]()
        this.#game = new Stage(Dom.container.querySelector("#first #center"))

        this.#game.onClear = () => {
            Dom.container.querySelector("#clear")?.classList.remove("hidden")
        }
    }
}
