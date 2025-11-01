import { Connector } from "../Games/Connector"
import { Game } from "../Games/Game"

export class Stage extends Game {
    protected override $setupElement(container: Element) {
        this.$defaultState = [1, 2, 4, 3, 0]

        for (let i = 0; i < 5; i++) {
            const vertex = this.$createVertex(
                Math.sin(2 * Math.PI * (i / 5)) * 26,
                -Math.cos(2 * Math.PI * (i / 5)) * 26,
                i,
            )
            this.$vertices.push(vertex)
            container.appendChild(vertex)
        }

        for (let i = 0; i < 5; i++) {
            const connector = new Connector(this.$vertices[i], this.$vertices[(i + 1) % 5])
            this.$connectors.set(connector, [i, (i + 1) % 5])
        }

        const connector = new Connector(this.$vertices[1], this.$vertices[4])
        this.$connectors.set(connector, [1, 4])
    }
}
