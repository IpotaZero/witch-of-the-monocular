import { Dom } from "../Dom"
import { Item, LocalStorage } from "../LocalStorage"
import { SE } from "../SE"
import { BGM } from "../utils/BGM"
import { Pages } from "../utils/Pages"
import { Scene } from "./Scene"
import { Scenes } from "./Scenes"

export class SceneTitle extends Scene {
    ready: Promise<void>
    #pages = new Pages()

    constructor(history?: string[]) {
        super()
        this.ready = this.#setup(history)
    }

    async #setup(history?: string[]) {
        const html = await (await fetch("pages/title.html")).text()
        await this.#pages.load(Dom.container, html, { history })

        BGM.ffp("assets/sounds/title.mp3")

        this.#pages.on("start", async () => {
            // @ts-ignore
            const modules = import.meta.glob("./SceneAdventure*")

            const url = `./SceneAdventure${LocalStorage.getChapter()}.ts`

            const { SceneAdventure } = await modules[url]()
            await Scenes.goto(() => new SceneAdventure(), { msIn: 400, msOut: 800 })
        })

        this.#pages.before("fullscreen", async () => {
            if (document.fullscreenElement) {
                document.exitFullscreen()
            } else {
                document.body.requestFullscreen()
            }
            return true
        })

        const stages: Item[] = ["1階のカギ"]

        stages.forEach((item) => {
            this.#pages.before(item, async () => {
                const { SceneGame } = await import("./SceneGame")
                await Scenes.goto(() => new SceneGame(item, { from: "title" }), { mode: "fade" })
                return true
            })
        })

        this.#setupCleared()
        this.#setupSetting()
        this.#particle()

        this.#pages.updateButtons()
    }

    #particle() {
        const title = this.#pages.pages.get("first")!

        for (let i = 0; i < 16; i++) {
            const p = new Image()
            p.src = "assets/images/particle0.png"
            p.classList.add("particle0")

            const size = Math.random() * 16

            p.style.animationDelay = `${size / 2}s`
            p.style.width = `${size + 16}vh`
            p.style.animationDuration = `${Math.random() * 4 + 8}s`
            p.style.aspectRatio = "1"
            p.style.position = "absolute"
            p.style.left = `${10 + 80 * (i / 16)}%`

            title.appendChild(p)
        }
    }

    #setupCleared() {
        const stages: Item[] = [
            "1階のカギ",
            "包丁",
            "ライター",
            "空のバケツ",
            "ぬるついたハンマー",
            "ヘアピン",
            "魔導書",
            "薄い本",
        ]

        const past = this.#pages.pages.get("past")!

        const cleared = LocalStorage.getClearedStageId()

        stages.forEach((id) => {
            if (!cleared.includes(id)) return

            past.innerHTML += `<button data-link="stage-${id}">${id}</button>`
            this.#pages.before(`stage-${id}`, async () => {
                const { SceneGame } = await import("./SceneGame")
                await Scenes.goto(() => new SceneGame(id, { from: "title" }), { mode: "fade" })
            })
        })
    }

    #setupSetting() {
        const { bgm, se } = LocalStorage.getVolume()

        const b = Dom.container.querySelector<HTMLInputElement>("#bgm-volume")!
        const s = Dom.container.querySelector<HTMLInputElement>("#se-volume")!

        b.value = "" + bgm
        s.value = "" + se

        BGM.setVolume(bgm / 9)
        SE.setVolume(se / 9)

        b.oninput = () => {
            BGM.setVolume(+b.value / 9)
            LocalStorage.setVolume({ bgm: +b.value, se: +s.value })
        }

        s.oninput = () => {
            SE.setVolume(+s.value / 9)
            LocalStorage.setVolume({ bgm: +b.value, se: +s.value })
        }

        const d = Dom.container.querySelector<HTMLButtonElement>("#delete-data")!
        d.onclick = () => {
            localStorage.clear()

            Scenes.goto(() => new SceneTitle())
        }
    }
}
