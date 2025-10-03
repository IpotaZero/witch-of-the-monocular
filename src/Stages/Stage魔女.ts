import { Connector } from "../Games/Connector"
import { Game } from "../Games/Game"

export class Stage extends Game {
    protected override $setupElement(container: Element) {
        this.$defaultState = [3, 6, 5, 7, 1, 4, 2, 0]

        let i = 0

        this.v(-24, -24, i++, container)
        this.v(0, -24, i++, container)
        this.v(24, -24, i++, container)
        this.v(-24, 0, i++, container)
        this.v(24, 0, i++, container)
        this.v(-24, 24, i++, container)
        this.v(0, 24, i++, container)
        this.v(24, 24, i++, container)

        this.e(0, 1)
        this.e(1, 2)
        this.e(5, 6)
        this.e(6, 7)

        this.e(0, 3)
        this.e(2, 4)
        this.e(3, 5)
        this.e(4, 7)

        this.e(0, 7)
        this.e(2, 5)
        this.e(1, 6)
        this.e(3, 4)
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
