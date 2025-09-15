export class Sound {
    #audio: HTMLAudioElement

    constructor(path: string, volume: number = 1) {
        this.#audio = new Audio(path)
        this.#audio.volume = volume
    }

    get duration() {
        return this.#audio.duration
    }

    play() {
        this.#audio.currentTime = 0
        this.#audio.play()
    }

    setVolume(volume: number) {
        this.#audio.volume = volume
    }
}

export class SE {
    static voice = new Sound("assets/sounds/voice.wav")
    static what = new Sound("assets/sounds/what.wav")
    static surprised = new Sound("assets/sounds/surprised.wav")
    static strong = new Sound("assets/sounds/strong.wav")

    static setVolume(volume: number) {
        Object.values(this).forEach((se) => {
            se.setVolume(volume)
        })
    }
}
