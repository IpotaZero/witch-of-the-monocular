import { Dom } from "../Dom"
import { getItem1, Item, itemMap } from "../Item"
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
            if (LocalStorage.getFlags().includes("2階")) return
            LocalStorage.addFlag("2階")

            Serif.say("私の部屋に行けば何とかなるはず。探してみて!")
        })

        this.#pages.before("寝室", async () => {
            if (LocalStorage.getFlags().includes("寝室開放")) return

            const items = LocalStorage.getItems()

            if (items.includes("ヘアピン") && items.includes("魔導書")) {
                Serif.say("(魔導書に載っていた魔術でヘアピンをカギに変えて開けた。)", "黒魔術の才能がありそうだねえ。")
                await Serif.wait()
                LocalStorage.addFlag("寝室開放")
            } else if (items.includes("ハンマー")) {
                Serif.say("(ハンマーで鍵をブッ壊した。)", "やるねえ。")
                await Serif.wait()
                LocalStorage.addFlag("寝室開放")
            } else if (items.includes("ぬるついたハンマー")) {
                Serif.say("ハンマー? そんなぬるぬるじゃあ危ないよ。")
                await Serif.wait()
                return true
            } else {
                Serif.say("(鍵がかかっている。)", "壊すための道具を探すか、鍵を探すかかな。")
                await Serif.wait()
                return true
            }
        })

        // serif
        this.#pages.on("寝室", async () => {
            if (!LocalStorage.getFlags().includes("寝室")) {
                Serif.say("そこの窓から外に出られるはず。大丈夫! 下は柔らかい土だから。")
                await Serif.wait()
                LocalStorage.addFlag("寝室")
            }
        })

        this.#pages.before("ベッド", async () => {
            Serif.say("(黴臭いベッド。)", "最近こっちに来てないから。。。")
            await Serif.wait()
            return true
        })

        this.#pages.before("ベッド下", async () => {
            Serif.say("あーっ! 覗くな!")
        })

        this.#pages.before("窓", async () => {
            Serif.say("(!)", "(足を踏み出した瞬間突然床が抜け落ちた!)")
            await Serif.wait()

            LocalStorage.setChapter(2)
            this.#pages.shaveBranch(1)

            const { SceneAdventure } = await import("./SceneAdventure2")

            await Scenes.goto(() => new SceneAdventure())
        })

        this.#pages.before("本棚", async () => {
            Serif.say("(「グラフ理論入門」、「線形代数と数え上げ」、「幾何学I」......)")
            await Serif.wait()
            return true
        })

        this.#pages.before("湯舟", async () => {
            if (LocalStorage.getFlags().includes("お風呂")) {
                Serif.say("(もう入った。)")
                await Serif.wait()
            } else {
                Serif.say("(空っぽの湯舟。)", "入る?", "(入ることにした。)")
                await Serif.wait()
                await Awaits.fadeOut(Dom.container, 1000)
                await Awaits.fadeIn(Dom.container, 1000)
                Serif.say("(いい湯だった。)")
                await Serif.wait()
                LocalStorage.addFlag("お風呂")
            }

            return true
        })

        this.#pages.before("おトイレ", async () => {
            if (LocalStorage.getFlags().includes("おトイレ")) {
                Serif.say("(もうした。)")
                await Serif.wait()
            } else {
                Serif.say("あー。ごゆっくり。")
                await Serif.wait()
                await Awaits.fadeOut(Dom.container, 1000)
                await Awaits.fadeIn(Dom.container, 1000)
                Serif.say("おかえりっ。")
                await Serif.wait()
                LocalStorage.addFlag("おトイレ")
            }

            return true
        })
        // serif end

        this.#pages.before("石鹸", async () => {
            if (LocalStorage.getItems().includes("ぬるついたハンマー")) {
                Serif.say("(ハンマーを洗った。)")
                await Serif.wait()

                LocalStorage.removeItem("ぬるついたハンマー")
                LocalStorage.addItem("ハンマー")

                this.#update()
            } else {
                Serif.say("(ボディソープ等。)")
                await Serif.wait()
            }

            return true
        })

        const getItem = getItem1

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

        const html = await (await fetch("pages/adventure1.html")).text()
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
