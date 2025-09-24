import { Connector } from "../Games/Connector"
import { Game } from "../Games/Game"

export class Stage extends Game {
    protected override $setupElement(container: Element) {
        this.$defaultState = [3, 6, 5, 1, 4, 2, 0]

        this.v(-24, -24, 0, container)
        this.v(0, -24, 1, container)
        this.v(-24, 0, 2, container)
        this.v(0, 0, 3, container)
        this.v(24, 0, 4, container)
        this.v(0, 24, 5, container)
        this.v(24, 24, 6, container)

        this.e(0, 1)
        this.e(2, 3)
        this.e(3, 4)
        this.e(5, 6)

        this.e(0, 2)
        this.e(1, 3)
        this.e(3, 5)
        this.e(4, 6)

        this.e(1, 4)
        this.e(2, 5)
    }

    v(x: number, y: number, value: number, container: Element) {
        const vertex = this.$createVertex(x, y, value)
        this.$vertices.push(vertex)
        container.appendChild(vertex)
    }

    e(i: number, j: number) {
        const connector = new Connector(this.$vertices[i], this.$vertices[j])
        this.$connectors.set(connector, [i, j])
    }
}
