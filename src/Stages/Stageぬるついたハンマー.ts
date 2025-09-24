import { Connector } from "../Games/Connector"
import { Game } from "../Games/Game"

export class Stage extends Game {
    protected override $setupElement(container: Element) {
        this.$defaultState = [3, 4, 1, 5, 2, 0, 6]

        for (let i = 0; i < 7; i++) {
            const p = [-Math.cos((Math.PI * 2 * i) / 7) * 28, Math.sin((Math.PI * 2 * i) / 7) * 28]
            const vertex = this.$createVertex(p[1], p[0], i)
            this.$vertices.push(vertex)
            container.appendChild(vertex)
        }

        for (let i = 0; i < this.$vertices.length; i++) {
            for (let j = i + 1; j < this.$vertices.length; j++) {
                if ((i + j) % 7 === 0) return

                const arrow = 0 === (j - i - 1) % 7
                const connector = new Connector(this.$vertices[i], this.$vertices[j], {
                    width: 6,
                    arrow,
                })
                this.$connectors.set(connector, [i, j])
            }
        }
    }
}
