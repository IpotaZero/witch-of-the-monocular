import { Dom } from "./Dom"
import { Scenes } from "./Scenes/Scenes"
import { SceneTitle } from "./Scenes/SceneTitle"
import { Serif } from "./utils/Serif"

Serif.init()
Dom.init()
Scenes.init(new SceneTitle())

window.addEventListener("contextmenu", (e) => {
    e.preventDefault()
})
