import { Dom } from "../Dom"
import { Item, itemMap } from "../Item"
import { LocalStorage } from "../LocalStorage"
import { Awaits } from "../utils/Awaits"
import { BGM } from "../utils/BGM"
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
        LocalStorage.setCurrentBranch(this.#pages.getCurrentBranch())
    }

    async #setup() {
        this.#pages.before("title", async () => {
            this.#pages.shaveBranch(1)

            const { SceneTitle } = await import("./SceneTitle")

            await Scenes.goto(() => new SceneTitle())

            return true
        })

        this.#pages.on("first", () => {
            if (LocalStorage.getFlags().includes("地下")) return
            LocalStorage.addFlag("地下")

            Serif.say("大丈夫!?", "とりあえず......出口を探そうか。")
        })

        const serifs = {
            "大穴": ["(ここから落ちてきたみたいだ。)"],
            "格子": ["(さすがに通れそうにない。)"],
            "扉": ["(開かない。)"],
        }

        Object.entries(serifs).forEach(([link, serif]) => {
            this.#pages.before(link, async () => {
                Serif.say(...serif)
                await Serif.wait()
                return true
            })
        })

        this.#pages.onLeft("first", async () => {
            Serif.say("(穴が開いている。ギリギリ通れそうだ。)")
            await Serif.wait()
        })

        const getItem: Item[] = []

        getItem.forEach((item) => {
            this.#pages.before("get-" + item, async () => {
                this.#pages.shaveBranch(1)

                const { SceneGame } = await import("./SceneGame")
                await Scenes.goto(() => new SceneGame(item, { from: "adventure" }), { mode: "fade" })

                return true
            })
        })

        getItem.forEach((item) => {
            this.#pages.on("clear-" + item, async (page) => {
                LocalStorage.addItem(item)
                this.#update()
                page.back(1, { msIn: 0, msOut: 0 })

                Serif.say(`(${item}を手に入れた。)`)
            })
        })

        const html = await (await fetch("pages/adventure2.html")).text()
        await this.#pages.load(Dom.container, html, { history: LocalStorage.getCurrentBranch() })

        this.#update()
    }

    #update() {
        const qs = (link: string, hidden: boolean) =>
            Dom.container.querySelector<HTMLElement>(`[data-link="${link}"]`)?.classList.toggle("hidden", hidden)

        const itemSerif = itemMap

        ;[...Dom.container.querySelector("#item")!.children]
            .filter((c) => !c.hasAttribute("data-back"))
            .forEach((c) => c.remove())

        LocalStorage.getItems().forEach((item) => {
            qs(item, true)

            Dom.container.querySelector("#item")!.innerHTML += `<button data-link="item-${item}">${item}</button>`

            this.#pages.before(`item-${item}`, async () => {
                Serif.say(itemSerif[item] ?? "エラー")
                return true
            })
        })

        if (LocalStorage.getItems().includes("ハンマー")) {
            qs("ぬるついたハンマー", true)
        }

        this.#pages.updateButtons()

        Dom.container.querySelector<HTMLElement>("#update")!.onclick = async () => {
            LocalStorage.setCurrentBranch(this.#pages.getCurrentBranch())
            this.#setup()
        }
    }
}
