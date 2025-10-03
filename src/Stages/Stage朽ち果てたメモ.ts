import { Connector } from "../Games/Connector"
import { Game } from "../Games/Game"

export class Stage extends Game {
    protected override $setupElement(container: Element) {
        this.$defaultState = [3, 9, 10, 4, 7, 11, 8, 12, 1, 13, 14, 2, 15, 0, 5, 6]

        for (let i = 0; i < 16; i++) {
            this.v(((i % 4) - 1.5) * 24, (~~(i / 4) - 1.5) * 24, i, container)
        }

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                this.e(j + 4 * i, j + 4 * (i + 1))
            }
        }

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                this.e(j + 4 * i, j + 4 * i + 1)
            }
        }
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
