import { Dom } from "../Dom"
import { Item, LocalStorage } from "../LocalStorage"
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
        this.#pages.on("room-0", () => {
            if (LocalStorage.getFlags().includes("met")) return
            LocalStorage.addFlag("met")

            Serif.say(
                "(頭の中から笑い声が聞こえる。)",
                "くすくす......",
                "この家に入ってきちゃうなんて、君は本当に馬鹿だねえ......",
                "とはいえ鍵をかけてなかった私も悪い。",
                "よって、君がこの家を出られるよう、手助けをしてあげよう。",
                "私は今手が離せないから、そっちには行けないけどね。",
                "さあ、そこの扉をくぐって......",
            )
        })

        this.#pages.on("room-1", () => {
            if (LocalStorage.getFlags().includes("1st")) return

            LocalStorage.addFlag("1st")
            Serif.say("2階から外に出る方法があるんだ。<br>まずは階段を探そう。")
        })

        this.#pages.on("1階のカギ", (page) => {
            Serif.say(
                "そうそう、この家の物には盗難防止の魔法がかかっているから、手に入れるためには魔法を解かなくちゃいけないんだ。",
                "すべての道具を使う必要はないかもしれないけど、見つけたものは持っていって構わないよ。",
                "まあ百聞は一見に如かず。一緒に解いてみよう!",
            )
        })

        this.#pages.on("包丁", (page) => {
            Serif.say("(包丁。)")
        })

        this.#pages.on("ライター", (page) => {
            Serif.say("(ライター。)")
        })

        const getItem: Item[] = ["1階のカギ", "包丁", "ライター", "空のバケツ"]

        getItem.forEach((item) => {
            this.#pages.before("get-" + item, async () => {
                this.#pages.shaveBranch(1)

                const { SceneGame } = await import("./SceneGame")
                await Scenes.goto(() => new SceneGame(item, { from: "adventure" }), { mode: "fade" })

                return true
            })
        })

        this.#pages.before("get-1階のカギ", async (page) => {
            this.#pages.shaveBranch(1)

            const { SceneGame } = await import("./SceneGame")
            await Scenes.goto(() => new SceneGame("1階のカギ", { from: "adventure" }), { mode: "fade" })
            Serif.say(
                "さて、ではこの魔法陣の説明をしよう。",
                "各マスの中に2つ数字があるのが見えるかな?",
                "左上の数字はそこに入るべき数字。真ん中の数字は今入っている数字だよ。",
                "何も入っていないマスがあるのには気づいたかな?",
                "この空白マスには線でつながった別のマスの数字をスライドさせることが出来るんだ。",
                "線をクリックしてスライドして、すべてのマスの左上と中の数字を一致させてみよう!",
            )

            return true
        })

        getItem.forEach((item) => {
            this.#pages.on("clear-" + item, async (page) => {
                LocalStorage.addItem(item)
                this.#update()
                page.back(1, { msIn: 0, msOut: 0 })

                Serif.say(item + "を手に入れた。")
            })
        })

        this.#pages.before(".*", async () => {
            Serif.hide()
        })

        this.#pages.before("水バケツ", async () => {
            if (LocalStorage.getItems().includes("空のバケツ")) {
                LocalStorage.removeItem("空のバケツ")
                LocalStorage.addItem("水の入ったバケツ")
                Serif.say("(バケツに水を入れた。)")
            } else {
                Serif.say("(水は出そうだ。)")
            }

            await Serif.wait()

            return true
        })

        this.#pages.before("room-1", async (page) => {
            if (LocalStorage.getItems().includes("1階のカギ")) {
                if (!LocalStorage.getFlags().includes("key-0")) {
                    Serif.say("(鍵を開けた。)")
                    await Serif.wait()
                    LocalStorage.addFlag("key-0")
                }
                return false
            } else {
                Serif.say("(鍵がかかっている。)", "あれ、その辺りに鍵はあるかな?")
                return true
            }
        })

        this.#pages.on("階段-不", async () => {
            const items = LocalStorage.getItems()

            if (items.includes("ライター") && items.includes("水の入ったバケツ")) {
                Serif.say("(ツタを燃やしてバケツの水で消火した。)")
                LocalStorage.addFlag("ツタを切った")
                await Serif.wait()
                this.#nextChapter()
            } else if (items.includes("包丁")) {
                Serif.say("(包丁でツタを切った。)")
                LocalStorage.addFlag("ツタを切った")
                await Serif.wait()
                this.#nextChapter()
            } else if (items.includes("ライター")) {
                Serif.say("ツタを燃やすの? 消火用の何かがあればいいんだけど......。")
                await Serif.wait()
            } else {
                Serif.say("えぇっ!? ツタが伸びまくってるじゃん!?", "何か道具を探さなくちゃね。")
            }
        })

        this.#pages.before("title", async () => {
            this.#pages.shaveBranch(1)

            const { SceneTitle } = await import("./SceneTitle")

            await Scenes.goto(() => new SceneTitle())

            return true
        })

        const html = await (await fetch("pages/adventure0.html")).text()
        await this.#pages.load(Dom.container, html, { history: LocalStorage.getCurrentBranch() })

        Dom.container.querySelectorAll(".serif").forEach((b) => {
            const serif = b.getAttribute("data-link")!

            this.#pages.before(serif, async () => {
                Serif.say(serif)
                await Serif.wait()
                return true
            })
        })

        // Dom.container.querySelector<HTMLElement>("#back")!.onclick = () => {
        //     this.#pages.back(1)
        // }

        this.#update()
    }

    #nextChapter() {
        LocalStorage.setChapter(1)

        // const {SceneAdventure} = await import("./")
    }

    #update() {
        const qs = (link: string, hidden: boolean) =>
            Dom.container.querySelector<HTMLElement>(`[data-link="${link}"]`)?.classList.toggle("hidden", hidden)

        const itemSerif: Partial<Record<Item, string>> = {
            "1階のカギ": "玄関のすぐ奥の扉の鍵。......2重扉?",
            "包丁": "軽くて扱いやすい包丁。",
            "ライター": "よくあるライター。オイルは十分",
            "空のバケツ": "何の変哲もないバケツ。",
            "水の入ったバケツ": "水の入ったバケツ。地味に重い。",
        }

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

        qs(
            "空のバケツ",
            LocalStorage.getItems().includes("空のバケツ") || LocalStorage.getItems().includes("水の入ったバケツ"),
        )
        qs("階段-不", LocalStorage.getFlags().includes("ツタを切った"))
        qs("階段-可", !LocalStorage.getFlags().includes("ツタを切った"))

        this.#pages.updateButtons()

        Dom.container.querySelector<HTMLElement>("#update")!.onclick = async () => {
            LocalStorage.setCurrentBranch(this.#pages.getCurrentBranch())
            this.#setup()
        }
    }
}
