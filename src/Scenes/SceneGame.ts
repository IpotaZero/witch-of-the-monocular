import { Dom } from "../Dom"
import { Game } from "../Games/Game"
import { Item } from "../Item"
import { LocalStorage } from "../LocalStorage"
import { SE } from "../SE"
import { BGM } from "../utils/BGM"
import { Pages } from "../utils/Pages"
import { Scene } from "./Scene"
import { Scenes } from "./Scenes"

export class SceneGame extends Scene {
    ready: Promise<void>

    #pages = new Pages()
    #game!: Game

    #from: "title" | "adventure"

    constructor(id: Item, { from }: { from: "title" | "adventure" }) {
        super()

        this.#from = from

        this.ready = this.#setup(id)
    }

    async end(): Promise<void> {
        this.#game.destroy()
    }

    async #setup(id: Item) {
        const html = await (await fetch("pages/game.html")).text()
        await this.#pages.load(Dom.container, html)

        BGM.ffp("assets/sounds/puzzle.mp3", { loopStartS: 17.297, volume: 0.5 })

        this.#pages.on("back", async () => {
            this.#return()
        })

        this.#pages.on("retry", async (page) => {
            page.back(1, { msIn: 0, msOut: 0 })
            this.#game.reset()
        })

        this.#pages.on("clear", async (page) => {
            LocalStorage.addBranch(`clear-${id}`)
            this.#return()
        })

        this.#start(id)
    }

    async #return() {
        if (this.#from === "title") {
            const { SceneTitle } = await import("./SceneTitle")

            await Scenes.goto(() => new SceneTitle(["first", "past"]))

            return
        }

        // @ts-ignore
        const modules = import.meta.glob("./SceneAdventure*")

        const url = `./SceneAdventure${LocalStorage.getChapter()}.ts`

        const { SceneAdventure } = await modules[url]()
        await Scenes.goto(() => new SceneAdventure())
    }

    async #start(id: Item) {
        // @ts-ignore
        const modules = import.meta.glob("../Stages/*")

        const url = `../Stages/Stage${id}.ts`

        const { Stage } = await modules[url]()
        this.#game = new Stage(Dom.container.querySelector("#first #center"))

        this.#game.onClear = () => {
            Dom.container.querySelector("#clear")?.classList.remove("hidden")
            LocalStorage.addClearedStageId(id)
            SE.clear.play()
        }

        Dom.container.querySelector("#stage-id")!.textContent = `${id}`
    }
}
