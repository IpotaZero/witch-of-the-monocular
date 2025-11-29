import { Dom } from "./Dom"
import { LocalStorage } from "./LocalStorage"
import { ScenePretitle } from "./Scenes/ScenePretitle"
import { Scenes } from "./Scenes/Scenes"
import { Ask, Serif } from "./utils/Serif"

Ask.init()
Serif.init()
Dom.init()

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("delete") === "true") {
        LocalStorage.clear()
    }
    Scenes.init(new ScenePretitle())
})

window.addEventListener("contextmenu", (e) => {
    e.preventDefault()
})
