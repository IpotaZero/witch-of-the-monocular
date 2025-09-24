import { Dom } from "./Dom"
import { ScenePretitle } from "./Scenes/ScenePretitle"
import { Scenes } from "./Scenes/Scenes"
import { BGM } from "./utils/BGM"
import { Serif } from "./utils/Serif"

BGM.init()
Serif.init()
Dom.init()

document.addEventListener("DOMContentLoaded", () => {
    Scenes.init(new ScenePretitle())
})

window.addEventListener("contextmenu", (e) => {
    e.preventDefault()
})
