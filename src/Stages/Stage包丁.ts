import { Connector } from "../Games/Connector"
import { Game } from "../Games/Game"

export class Stage extends Game {
    protected override $setupElement(container: Element) {
        this.$defaultState = [1, 2, 4, 5, 3, 0]

        for (let i = 0; i < 6; i++) {
            const vertex = this.$createVertex(((i % 3) - 1) * 26, (~~(i / 3) - 0.5) * 26, i)
            this.$vertices.push(vertex)
            container.appendChild(vertex)
        }

        const connecters = [
            [0, 1],
            [1, 2],

            [3, 4],
            [4, 5],

            [0, 3],
            [1, 4],
            [2, 5],
        ]

        connecters.forEach(([i, j]) => {
            this.$connectors.set(new Connector(this.$vertices[i], this.$vertices[j]), [i, j])
        })
    }
}
