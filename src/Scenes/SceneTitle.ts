import { Dom } from "../Dom"
import { getItem0, getItem1, getItem2, Item, item0, item1, item2 } from "../Item"
import { LocalStorage } from "../LocalStorage"
import { SE } from "../SE"
import { BGM } from "../utils/BGM"
import { Pages } from "../utils/Pages"
import { Ask, Serif } from "../utils/Serif"
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
            if (LocalStorage.isCleared) {
                if (LocalStorage.getClearedStageId().includes("魔女")) {
                    Serif.say(
                        "(あれからあの屋敷の話は聞かない。)",
                        "(核となる魔女がいなくなり、力を失ったのか。)",
                        "(屋敷で見つけたものはまだ手元にある。)",
                        "(それだけがあの日の出来事を証明するだろう。)",
                    )
                } else {
                    Serif.say(
                        "(あの屋敷には、きっとまだ囚われたものがあるのだろう。)",
                        "(あなたはもし時を戻せたら、と思った。)",
                    )

                    document.querySelector("[data-link=setting]")!.classList.add("yurayura")
                    document.querySelector("[data-link=delete-adventure-data]")!.classList.add("yurayura")
                }

                await Serif.wait()
                this.#pages.back(1)
                return
            }

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

        const stages = [...getItem0, ...getItem1, ...getItem2]

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

            const size = Math.random() ** 2 * 24

            p.style.animationDelay = `${Math.random() * 8}s`
            p.style.width = `${size + 16}vh`
            p.style.animationDuration = `${Math.random() * 4 + 8}s`
            p.style.aspectRatio = "1"
            p.style.position = "absolute"
            p.style.left = `${10 + 80 * (i / 16)}%`

            p.style.setProperty("--rotation", Math.random() > 0.5 ? "-1" : "1")

            title.appendChild(p)
        }

        const img = new Image()
        img.src = "assets/images/particle1.png"

        this.#pages.pages.getValues().forEach((p) => {
            p.addEventListener("click", (e) => {
                const rect = (e.target as Element).getBoundingClientRect()
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top

                for (let i = 0; i < 8; i++) {
                    const particle = img.cloneNode() as HTMLImageElement
                    particle.style.position = "fixed"
                    particle.style.pointerEvents = "none"
                    particle.style.left = `calc(${rect.left + x}px - 4dvh)`
                    particle.style.top = `calc(${rect.top + y}px - 4dvh)`
                    particle.style.width = "8dvh"
                    particle.style.height = "8dvh"
                    particle.style.scale = "" + (Math.random() / 2 + 0.8)
                    particle.style.opacity = "" + Math.random() * 0.5
                    particle.style.transition = "transform 1s ease-out, opacity 1s ease-out"
                    particle.style.zIndex = "1000"
                    document.body.appendChild(particle)

                    const angle = (Math.PI * 2 * i) / 8 + Math.random()
                    const distance = 60 + Math.random() * 20
                    requestAnimationFrame(() => {
                        particle.style.transform = `translate(${(Math.cos(angle) * distance) / 8}dvh, ${
                            (Math.sin(angle) * distance) / 8
                        }dvh) scale(0.5) rotate(${(angle / Math.PI) * 180 * (Math.random() - 0.5)}deg)`
                        particle.style.opacity = "0"
                    })

                    setTimeout(() => {
                        particle.remove()
                    }, 1000)
                }
            })
        })
    }

    #setupCleared() {
        const stages = [...getItem0, ...getItem1, ...getItem2]

        const past = this.#pages.pages.get("past")!

        const cleared = LocalStorage.getClearedStageId()

        stages.forEach((id) => {
            if (!cleared.includes(id)) {
                past.innerHTML += `<button data-link="stage-${id}" class="uncleared-stage">${id}</button>`
            } else {
                past.innerHTML += `<button data-link="stage-${id}">${id}</button>`
                this.#pages.before(`stage-${id}`, async () => {
                    const { SceneGame } = await import("./SceneGame")
                    await Scenes.goto(() => new SceneGame(id, { from: "title" }), { mode: "fade" })
                })
            }
        })
    }

    #setupSetting() {
        const { bgm, se } = LocalStorage.getVolume()

        const b = Dom.container.querySelector<HTMLInputElement>("#bgm-volume")!
        const s = Dom.container.querySelector<HTMLInputElement>("#se-volume")!

        b.value = "" + bgm
        s.value = "" + se

        BGM.setVolume(bgm / 9)
        SE.setVolume(se / 9 / 2)

        b.oninput = () => {
            BGM.setVolume(+b.value / 9)
            LocalStorage.setVolume({ bgm: +b.value, se: +s.value })
        }

        s.oninput = () => {
            SE.setVolume(+s.value / 9 / 2)
            LocalStorage.setVolume({ bgm: +b.value, se: +s.value })
        }

        this.#pages.before("delete-adventure-data", async () => {
            const num = await Ask.ask(["本当に消す", "消さない"])

            if (num === "本当に消す") {
                localStorage.removeItem("flags")
                localStorage.removeItem("items")
                localStorage.removeItem("chapter")
                localStorage.removeItem("current-branch")
                localStorage.removeItem("is-cleared")

                Serif.say("(忘れた。)")
            }

            return true
        })

        this.#pages.before("delete-data", async () => {
            const num = await Ask.ask(["本当に消す", "消さない"])

            if (num === "本当に消す") {
                localStorage.clear()
                await Scenes.goto(() => new SceneTitle())
            }

            return true
        })
    }
}
