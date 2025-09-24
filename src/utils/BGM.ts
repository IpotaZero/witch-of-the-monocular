// src/audio/BGM.ts
export class BGM {
    static #context: AudioContext
    static #wholeGain: GainNode

    static #volume = 1
    static #initialized = false

    static #currentBGM: BGM | null = null

    #path: string
    #gain: GainNode
    #ready: Promise<void>
    #source: AudioBufferSourceNode | null = null
    #isStarted = false

    private constructor(path: string, options: { loopStartS?: number; loopEndS?: number } = {}) {
        this.#path = path

        this.#gain = BGM.#context.createGain()
        this.#gain.connect(BGM.#wholeGain)

        this.#ready = this.#localFetch(options)
    }

    async #localFetch(options: { loopStartS?: number; loopEndS?: number }) {
        const response = await fetch(this.#path)
        const arrayBuffer = await response.arrayBuffer()
        const buffer = await BGM.#context.decodeAudioData(arrayBuffer)

        this.#source = BGM.#context.createBufferSource()
        this.#source.buffer = buffer
        this.#source.loopStart = options.loopStartS ?? 0
        this.#source.loopEnd = options.loopEndS ?? buffer.duration
        this.#source.loop = true
        this.#source.connect(this.#gain)
    }

    async #localFadeOut(durationMS: number) {
        this.#gain.gain.cancelScheduledValues(BGM.#context.currentTime)
        this.#gain.gain.linearRampToValueAtTime(0, BGM.#context.currentTime + durationMS / 1000)

        await new Promise((resolve) => setTimeout(resolve, durationMS))

        if (this.#isStarted) this.#source?.stop()
        this.#source?.disconnect()
    }

    static init() {
        if (this.#initialized) throw new Error("すでにinitialized!")
        this.#initialized = true

        this.#context = new AudioContext()
        this.#wholeGain = this.#context.createGain()
        this.#wholeGain.connect(this.#context.destination)
    }

    static getPath() {
        return this.#currentBGM ? this.#currentBGM.#path : ""
    }

    static async ffp(path: string, options: { loopStartS?: number; loopEndS?: number; when?: number } = {}) {
        await Promise.all([this.#fadeOut(1000), this.#fetch(path, options)])

        if (this.getPath() === path) {
            this.#play(options.when)
        }
    }

    static async #fetch(path: string, options: { loopStartS?: number; loopEndS?: number; when?: number }) {
        this.#currentBGM = new BGM(path, options)
        await this.#currentBGM.#ready
    }

    static #play(when?: number) {
        if (!this.#currentBGM) return
        this.#currentBGM.#source?.start(this.#context.currentTime + (when ?? 0))
        this.#currentBGM.#isStarted = true
    }

    static setVolume(volume: number) {
        this.#volume = volume
        this.#wholeGain.gain.cancelScheduledValues(this.#context.currentTime)
        this.#wholeGain.gain.value = this.#volume
    }

    static #fadeOut(durationMS: number) {
        if (!this.#currentBGM) return
        this.#currentBGM.#localFadeOut(durationMS)

        return new Promise((resolve) => setTimeout(resolve, durationMS))
    }

    static async fade(volume: number, durationMS: number) {
        this.#wholeGain.gain.cancelScheduledValues(this.#context.currentTime)
        this.#wholeGain.gain.setValueAtTime(this.#volume, this.#context.currentTime)
        this.#wholeGain.gain.linearRampToValueAtTime(volume, this.#context.currentTime + durationMS / 1000)

        await new Promise((resolve) => setTimeout(resolve, durationMS))
    }
}

;(window as any).BGM = BGM
