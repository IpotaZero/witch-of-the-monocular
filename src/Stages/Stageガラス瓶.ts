import { Connector } from "../Games/Connector"
import { Game } from "../Games/Game"

export class Stage extends Game {
    protected override $setupElement(container: Element) {
        this.$defaultState = [0, 3, 5, 1, 2, 4]

        for (let i = 0; i < 6; i++) {
            this.v(-Math.sin((i / 6) * 2 * Math.PI) * 32, -Math.cos((i / 6) * 2 * Math.PI) * 32, i, container)
        }

        this.e(2, 0, true)
        this.e(4, 2, true)
        this.e(0, 4, true)
        this.e(3, 1, true)
        this.e(5, 3, true)
        this.e(1, 5, true)

        this.e(0, 1, true)
        this.e(1, 2, true)
        this.e(2, 3, true)
        this.e(3, 4, true)
        this.e(4, 5, true)
        this.e(5, 0, true)
    }

    v(x: number, y: number, value: number, container: Element) {
        const vertex = this.$createVertex(x, y, value)
        this.$vertices.push(vertex)
        container.appendChild(vertex)
    }

    e(i: number, j: number, arrow = false) {
        const connector = new Connector(this.$vertices[i], this.$vertices[j], { arrow })
        this.$connectors.set(connector, [i, j])
    }
}
