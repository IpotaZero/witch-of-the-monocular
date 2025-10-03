import { Connector } from "../Games/Connector"
import { Game } from "../Games/Game"

export class Stage extends Game {
    protected override $setupElement(container: Element) {
        this.$defaultState = [2, 3, 5, 1, 0, 4, 6]

        let i = 0

        this.v(32, -32, i++, container)
        this.v(-32, -32, i++, container)
        this.v(-32, 12, i++, container)

        this.v(-32, 32, i++, container)
        this.v(32, 32, i++, container)
        this.v(32, -12, i++, container)

        this.v(0, 0, i++, container)

        this.e(0, 1)
        this.e(1, 2)

        this.e(3, 4)
        this.e(4, 5)

        this.e(3, 6)
        this.e(6, 0)

        this.e(1, 6)
        this.e(4, 6)
        this.e(2, 6)
        this.e(5, 6)

        this.e(1, 5)
        this.e(2, 4)
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
