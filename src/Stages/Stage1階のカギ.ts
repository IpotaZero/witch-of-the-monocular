import { Connector } from "../Games/Connector"
import { Game } from "../Games/Game"

export class Stage extends Game {
    protected override $setupElement(container: Element) {
        this.$defaultState = [1, 2, 3, 0]

        for (let i = 0; i < 4; i++) {
            const vertex = this.$createVertex((i - 1.5) * 32, 0, i)
            this.$vertices.push(vertex)
            container.appendChild(vertex)
        }

        for (let j = 0; j < 3; j++) {
            const connector = new Connector(this.$vertices[j], this.$vertices[j + 1])
            this.$connectors.set(connector, [j, j + 1])
        }
    }
}
