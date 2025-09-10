import { Connector } from "../Games/Connector"
import { Game } from "../Games/Game"

export class Stage extends Game {
    protected override $setupElement(container: Element) {
        this.$defaultState = [3, 4, 5, 6, 8, 1, 7, 2, 0]

        for (let i = 0; i < 9; i++) {
            const vertex = this.$createVertex(((i % 3) - 1) * 26, (Math.floor(i / 3) - 1) * 26, i)
            this.$vertices.push(vertex)
            container.appendChild(vertex)
        }

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 3; j++) {
                const m = i + 3 * j
                const n = i + 1 + 3 * j

                const connector = new Connector(this.$vertices[m], this.$vertices[n], {
                    width: 6,
                })
                this.$connectors.set(connector, [m, n])
            }
        }

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                const m = i + 3 * j
                const n = i + 3 * j + 3

                const connector = new Connector(this.$vertices[m], this.$vertices[n], {
                    width: 6,
                })
                this.$connectors.set(connector, [m, n])
            }
        }
    }
}
