function generateSn(n: number): number[][] {
    const result: number[][] = []
    const num = [...Array(n).keys()]

    function permute(arr: number[], l: number) {
        if (l === arr.length - 1) {
            result.push([...arr])
            return
        }
        for (let i = l; i < arr.length; i++) {
            ;[arr[l], arr[i]] = [arr[i], arr[l]]
            permute(arr, l + 1)
            ;[arr[l], arr[i]] = [arr[i], arr[l]]
        }
    }

    permute(num, 0)
    return result
}

function replace(array: string, i: number, j: number): string {
    const copy = array.split("")
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    return copy.join("")
}

function getConnectedComponents(vertices: Vertex[], arcs: Set<Arc>): Vertex[][] {
    const visited = new Set<Vertex>()
    const adj = new Map<Vertex, Set<Vertex>>()

    // Build adjacency list
    for (const e of arcs) {
        const [a, b] = e.split(",")
        if (!adj.has(a)) adj.set(a, new Set())
        adj.get(a)!.add(b)
    }

    const components: Vertex[][] = []

    for (const v of vertices) {
        if (visited.has(v)) continue

        const stack = [v]
        const component: Vertex[] = []
        visited.add(v)

        while (stack.length) {
            const node = stack.pop()!
            component.push(node)
            for (const neighbor of adj.get(node) ?? []) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor)
                    stack.push(neighbor)
                }
            }
        }

        components.push(component)
    }

    return components
}

function findShortestPath(start: Vertex, goal: Vertex, arcs: Set<Arc>): Vertex[] | null {
    const queue: Vertex[][] = [[start]]
    const visited = new Set<Vertex>()
    visited.add(start)

    // Build adjacency map for quick lookup
    const adj = new Map<Vertex, Set<Vertex>>()

    for (const e of arcs) {
        const [a, b] = e.split(",")
        if (!adj.has(a)) adj.set(a, new Set())
        adj.get(a)!.add(b)
    }

    while (queue.length > 0) {
        const path = queue.shift()!

        // 先頭
        const current = path[path.length - 1]

        if (current === goal) {
            return path
        }

        for (const neighbor of adj.get(current) ?? new Set()) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor)
                queue.push([...path, neighbor])
            }
        }
    }

    return null
}

const moveMap = {
    0: [1, 2],
    1: [0, 2],
    2: [1, 5],
    3: [0, 4, 6],
    4: [1, 3, 5, 7],
    5: [2, 4],
    6: [3, 7],
    7: [4, 6],
} as const

type Vertex = string
type Arc = `${Vertex},${Vertex}`

// 頂点
const vertices: Vertex[] = generateSn(8).map((n) => n.join(""))
console.log("vertices: " + vertices.length)

// 辺とそれに対応する互換の組
const arcMap: Map<Arc, [number, number]> = new Map(
    vertices.flatMap((vertex) => {
        const i = vertex.indexOf("0") as keyof typeof moveMap
        return moveMap[i].map((target) => {
            const edge = [vertex, replace(vertex, target, i)].join(",") as Arc
            const replacement = [i, target] as [number, number]
            return [edge, replacement]
        })
    }),
)

// 辺
const arcs: Set<Arc> = new Set(arcMap.keys())
console.log("arcs: " + arcs.size)

// console.log(getConnectedComponents(vertices, arcs))

const goal: Vertex = "01234567"
const board: Vertex = "20634751"

const shortestPath = findShortestPath(board, goal, arcs)

if (shortestPath) {
    console.log(shortestPath)

    const actions = []

    for (let i = 0; i < shortestPath.length - 1; i++) {
        const arc = shortestPath.slice(i, i + 2).join(",") as Arc
        actions.push(arcMap.get(arc))
    }

    console.log(actions)
}
