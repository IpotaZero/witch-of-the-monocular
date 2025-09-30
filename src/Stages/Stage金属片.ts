import { Connector } from "../Games/Connector"
import { Game } from "../Games/Game"

export class Stage extends Game {
    protected override $setupElement(container: Element) {
        this.$defaultState = [3, 1, 2, 4, 0]

        let i = 0

        this.v(0, -32, i++, container)
        this.v(0, 0, i++, container)
        this.v(-32, 32, i++, container)
        this.v(0, 32, i++, container)
        this.v(32, 32, i++, container)

        this.e(0, 1)
        this.e(3, 2, true)
        this.e(4, 3, true)
        this.e(1, 2)
        this.e(1, 4)
        this.e(0, 2, true)
        this.e(4, 0, true)
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
