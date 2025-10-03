import { Dom } from "../Dom"
import { getItem0, getItem1, getItem2, Item, itemMap } from "../Item"
import { LocalStorage } from "../LocalStorage"
import { BGM } from "../utils/BGM"
import { Pages } from "../utils/Pages"
import { Ask, Serif } from "../utils/Serif"
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
        if (LocalStorage.getFlags().includes("土砂突破")) {
            BGM.ffp("assets/sounds/gishiki.mp3")
        } else {
            BGM.ffp("assets/sounds/魔力の止水域.m4a")
        }

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
            if (LocalStorage.getFlags().includes("土砂突破")) {
                Serif.say("(巨石はただそこに佇んでいる。)")
                await Serif.wait()
                return true
            }

            Serif.say(
                "(大きな石でできた祭壇。見つめていると不思議な気持ちになる。)",
                "何かをお供えすれば......もしかしたら......。",
            )
            await Serif.wait()

            const options = ["何もしない"]

            const items = LocalStorage.getItems()

            if (items.includes("ベル") && items.includes("楽譜") && items.includes("ガラス瓶")) {
                options.push("楽譜を供える")
            }

            const num = await Ask.ask(options)

            if (num === "何もしない") {
                return true
            } else {
                BGM.ffp("assets/sounds/gishiki.mp3", { loopEndS: 80 })

                Serif.say("(持ち物がひとりでに動き出し、音楽を奏で始める......。)", "(近くで大きな音がした。)")
                await Serif.wait()

                LocalStorage.addFlag("土砂突破")

                this.#update()

                return true
            }
        })

        this.#pages.before("蝋燭", async () => {
            if (LocalStorage.getItems().includes("金属片")) {
                Serif.say("(金属片を温めてみると形が変わり始めた。)", "(ベルを手に入れた。)")
                await Serif.wait()
                LocalStorage.removeItem("金属片")
                LocalStorage.addItem("ベル")
                this.#update()
            } else {
                Serif.say("(緑の炎が揺らめいている。)")
                await Serif.wait()
            }

            return true
        })

        this.#pages.before("外", async () => {
            const num = await Ask.ask(["外に出る", "出ない"])

            if (num === "外に出る") {
                return false
            } else {
                return true
            }
        })

        this.#pages.on("外", async () => {
            if (LocalStorage.getItems().includes("魔女")) {
                Serif.say(
                    "(階段を昇ると青空が見えた。)",
                    "うっ、眩しい......。",
                    "(鳥の囀りや、虫の声が何処かから聞こえてくる。)",
                    "(振り返れば、屋敷はただ、森の奥に沈んでいる。)",
                    "(それはもう、魔法のかかっていない、一つの屋敷だった。)",
                )
            } else {
                Serif.say(
                    "(階段を昇ると青空が見えた。)",
                    "(閉ざされた屋敷の影を抜け、眩しさに目を細める。)",
                    "(外は驚くほど静まり返っていて、全てが嘘だったかのように思えた。)",
                    "(手元にはいくつかの物が残っている。)",
                    "(選ばれたものと、選ばれなかったもの。)",
                    "(振り返れば、屋敷はただ、森の奥に沈んでいる。)",
                    "(また、獲物が来るのを待っている。)",
                )
            }

            await Serif.wait()

            LocalStorage.isCleared = true

            const { SceneTitle } = await import("./SceneTitle")
            await Scenes.goto(() => new SceneTitle(), { mode: "fade", msIn: 2000, msOut: 2000 })
        })

        this.#pages.before("魔女の扉", async () => {
            if (LocalStorage.getFlags().includes("魔女の部屋")) {
                return
            }

            Serif.say(
                "(扉の向こうから何かの気配がする。)",
                "(頭の中ではなく直接声が聞こえた。)",
                "やあ。うまくいったみたいだね。だけど、早く出ていった方がいいよ。",
                "言ったでしょう? この屋敷には物を持ち出せなくする魔法がかかっているんだ。",
                "だから......私はここから動けない。",
                "君までこの屋敷の物になってしまう前に、早く。",
            )

            Serif.wait().then(async () => {
                if (
                    LocalStorage.getClearedStageId().length ===
                    getItem0.length + getItem1.length + getItem2.length - 1
                ) {
                    Serif.say("(得てきたものが、あなたに勇気を与えた。)", "(あなたは一歩踏み出し、扉を開けた。)")
                    await Serif.wait()
                    LocalStorage.addFlag("魔女の部屋")
                    this.#pages.goto("魔女の部屋")
                } else {
                    Serif.say("(あなたは怖気づいて扉から一歩離れた。)")
                    await Serif.wait()
                    this.#pages.back(1)
                }
            })
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

                LocalStorage.setCurrentBranch(this.#pages.getCurrentBranch())
            })
        })

        this.#pages.on("clear-魔女", async (page) => {
            LocalStorage.addItem("魔女")
            this.#update()
            page.back(1, { msIn: 0, msOut: 0 })

            Serif.say(`(魔女を助けた。)`)

            LocalStorage.setCurrentBranch(this.#pages.getCurrentBranch())
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

        this.#pages.before("save", async () => {
            LocalStorage.setCurrentBranch(this.#pages.getCurrentBranch().slice(0, -1))
            Serif.say("(出来事を記憶に留めた。)")
            return true
        })
    }
}
