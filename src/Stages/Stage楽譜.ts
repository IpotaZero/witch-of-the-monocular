import { Connector } from "../Games/Connector"
import { Game } from "../Games/Game"

export class Stage extends Game {
    protected override $setupElement(container: Element) {
        this.$defaultState = [0, 6, 3, 5, 1, 2, 4]

        let i = 0

        this.v(-36, -16, i++, container)
        this.v(-56, 20, i++, container)
        this.v(-16, 20, i++, container)

        this.v(16, -16, i++, container)
        this.v(52, -16, i++, container)
        this.v(16, 20, i++, container)
        this.v(52, 20, i++, container)

        this.e(0, 1)
        this.e(1, 2)
        this.e(2, 0)

        this.e(3, 4)
        this.e(4, 6)
        this.e(6, 5)
        this.e(5, 3)

        this.e(2, 5)
        this.e(0, 3)
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
