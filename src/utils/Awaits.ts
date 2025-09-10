export class Awaits {
    static async fade(container: HTMLElement, ms: number = 200) {
        await this.fadeOut(container, ms)
        this.fadeIn(container, ms)
    }

    static async fadeOut(container: HTMLElement, ms: number = 200) {
        container.style.transition = "opacity 0s"

        await this.frame(() => {
            container.style.opacity = "1"
        })

        await this.frame(() => {
            container.style.transition = `opacity ${ms}ms`
        })

        await this.frame(() => {
            container.style.opacity = "0"
            container.style.pointerEvents = "none"
        })

        await this.sleep(ms)
    }

    static async fadeIn(container: HTMLElement, ms: number = 200) {
        container.style.transition = "opacity 0s"

        await this.frame(() => {
            container.style.opacity = "0"
        })

        await this.frame(() => {
            container.style.transition = `opacity ${ms}ms`
        })

        await this.frame(() => {
            container.style.opacity = "1"
            container.style.pointerEvents = ""
        })

        await this.sleep(ms)
    }

    static sleep(ms: number) {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, ms)
        })
    }

    static ok() {
        const abort = new AbortController()

        return new Promise<void>((resolve) => {
            document.addEventListener(
                "click",
                () => {
                    abort.abort()
                    resolve()
                },
                { signal: abort.signal },
            )

            document.addEventListener(
                "keydown",
                (e) => {
                    if (["KeyZ", "Enter", "Space"].includes(e.code)) {
                        abort.abort()
                        resolve()
                    }
                },
                { signal: abort.signal },
            )
        })
    }

    static key() {
        const abort = new AbortController()

        return new Promise<void>((resolve) => {
            document.addEventListener(
                "click",
                () => {
                    abort.abort()
                    resolve()
                },
                { signal: abort.signal },
            )

            document.addEventListener(
                "keydown",
                (e) => {
                    abort.abort()
                    resolve()
                },
                { signal: abort.signal },
            )
        })
    }

    static frame(fn = () => {}) {
        return new Promise<void>((resolve) =>
            requestAnimationFrame(() => {
                fn()
                resolve()
            }),
        )
    }

    static async enter(container: HTMLElement, ms: number) {
        container.style.transition = "opacity 0s, scale 0s"
        container.style.pointerEvents = "none"

        await this.frame(() => {
            container.style.opacity = "0"
            container.style.scale = "0"
        })

        await this.frame(() => {
            container.style.transition = `opacity ${ms}ms, scale ${ms}ms`
        })

        await this.frame(() => {
            container.style.opacity = "1"
            container.style.scale = "1"
            container.style.pointerEvents = ""
        })

        await this.sleep(ms)

        this.frame()

        container.style.pointerEvents = "all"
    }

    static async enterReverse(container: HTMLElement, ms: number) {
        container.style.transition = "opacity 0s, scale 0s"
        container.style.pointerEvents = "none"

        await this.frame(() => {
            container.style.opacity = "1"
            container.style.scale = "1"
        })

        await this.frame(() => {
            container.style.transition = `opacity ${ms}ms, scale ${ms}ms`
        })

        await this.frame(() => {
            container.style.opacity = "0"
            container.style.scale = "0"
            container.style.pointerEvents = ""
        })

        await this.sleep(ms)

        this.frame()

        container.style.pointerEvents = "all"
    }

    static async exit(container: HTMLElement, ms: number) {
        container.style.transition = "opacity 0s, scale 0s"
        container.style.pointerEvents = "none"

        await this.frame(() => {
            container.style.opacity = "1"
            container.style.scale = "1"
        })

        await this.frame(() => {
            container.style.transition = `opacity ${ms}ms, scale ${ms}ms`
        })

        await this.frame(() => {
            container.style.opacity = "0"
            container.style.scale = "3"
            container.style.pointerEvents = ""
        })

        await this.sleep(ms)

        this.frame()

        container.style.pointerEvents = "all"
    }

    static async exitReverse(container: HTMLElement, ms: number) {
        container.style.transition = "opacity 0s, scale 0s"
        container.style.pointerEvents = "none"

        await this.frame(() => {
            container.style.opacity = "0"
            container.style.scale = "3"
        })

        await this.frame(() => {
            container.style.transition = `opacity ${ms}ms, scale ${ms}ms`
        })

        await this.frame(() => {
            container.style.opacity = "1"
            container.style.scale = "1"
            container.style.pointerEvents = ""
        })

        await this.sleep(ms)

        this.frame()

        container.style.pointerEvents = "all"
    }
}
