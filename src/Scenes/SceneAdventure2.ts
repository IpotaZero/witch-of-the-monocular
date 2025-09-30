import { Dom } from "../Dom"
import { getItem2, Item, itemMap } from "../Item"
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

        this.#pages.on("地下通路-不", () => {
            Serif.say("(階段から雪崩れ込んだ土砂が道を塞いでいる。)", "そんな。")
        })

        this.#pages.before("祭壇", async () => {
            if (0) {
                Serif.say(
                    "(大きな石でできた祭壇。見つめていると不思議な気持ちになる。)",
                    "何かをお供えすれば......もしかしたら......。",
                )
                await Serif.wait()
            } else {
                Serif.say("(持ち物がひとりでに動き出し、音楽を奏で始める......。)", "(近くで大きな音がした。)")
                await Serif.wait()

                LocalStorage.addFlag("土砂突破")
            }

            return true
        })

        this.#pages.before("蝋燭", async () => {
            if (LocalStorage.getItems().includes("金属片")) {
                Serif.say("(金属片を温めてみると形が変わり始めた。)", "(ベルを手に入れた。)")
                await Serif.wait()
                LocalStorage.removeItem("金属片")
                LocalStorage.addItem("ベル")
                this.#update()
            } else {
                Serif.say("(青い炎が揺らめいている。)")
                await Serif.wait()
            }

            return true
        })

        const serifs = {
            "大穴": ["(ここから落ちてきたみたいだ。)"],
            "格子": ["(さすがに通れそうにない。)"],
            "扉": ["(開かない。)"],
            "地下絵画": [
                "(冒涜的なものを感じる絵。)",
                "宗教は人だけでなく、魔女さえも狂わせたんだ。",
                "昔の話だけどね。",
            ],
            "樽": ["(何かの発酵したような臭いがする。)"],
            "箒": ["昔は誰でも大空を飛べたんだ。今は......どうなのかな。"],
        }

        Object.entries(serifs).forEach(([link, serif]) => {
            this.#pages.before(link, async () => {
                Serif.say(...serif)
                await Serif.wait()
                return true
            })
        })

        const getItem = getItem2

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

        const items = LocalStorage.getItems()

        items.forEach((item) => {
            qs(item, true)

            Dom.container.querySelector("#item")!.innerHTML += `<button data-link="item-${item}">${item}</button>`

            this.#pages.before(`item-${item}`, async () => {
                Serif.say(itemSerif[item] ?? "エラー")
                return true
            })
        })

        if (LocalStorage.getItems().includes("ベル")) {
            qs("金属片", true)
        }

        const h = Dom.container.querySelector("[data-link=地下通路-不]")!
        const k = Dom.container.querySelector("[data-link=地下通路-可")!

        if (LocalStorage.getFlags().includes("土砂突破")) {
            h.classList.add("hidden")
            k.classList.remove("hidden")
        } else {
            k.classList.add("hidden")
            h.classList.remove("hidden")
        }

        this.#pages.updateButtons()

        Dom.container.querySelector<HTMLElement>("#update")!.onclick = async () => {
            LocalStorage.setCurrentBranch(this.#pages.getCurrentBranch())
            this.#setup()
        }
    }
}
