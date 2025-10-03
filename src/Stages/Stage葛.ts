import { Connector } from "../Games/Connector"
import { Game } from "../Games/Game"

export class Stage extends Game {
    protected override $setupElement(container: Element) {
        this.$defaultState = [0, 6, 4, 3, 1, 7, 2, 5]

        let i = 0

        this.v(16, -8, i++, container)
        this.v(-32, -8, i++, container)
        this.v(-32, 24, i++, container)
        this.v(16, 24, i++, container)

        this.v(-16, -24, i++, container)
        this.v(32, -24, i++, container)
        this.v(32, 8, i++, container)
        this.v(-16, 8, i++, container)

        this.e(0, 1)
        this.e(1, 2)
        this.e(2, 3)

        this.e(4, 5)
        this.e(5, 6)
        this.e(6, 7)

        this.e(3, 4)
        this.e(7, 0)
        this.e(4, 7)
        this.e(3, 0)
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
