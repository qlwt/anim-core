import type { Anim } from "#src/anim/type/Anim.js"

export type AnimLine_Point = {
    readonly state: number
}

export type AnimNewLine_Config = {
    readonly target: number
    /** expected to be a positive number */
    readonly velocity: number
    readonly effect: (state: number) => void
}

export const anim_new_line = (config: AnimNewLine_Config): Anim<AnimLine_Point> => {
    return {
        emit(point) {
            config.effect(point.state)
        },

        emitdiff(from, to) {
            if (from.state !== to.state) {
                config.effect(to.state)
            }
        },

        finished(point) {
            return point.state === config.target
        },

        step(point, timeskip) {
            const displacement = config.target - point.state
            const direction = Math.sign(displacement)
            const range = Math.abs(displacement)
            const movement = config.velocity * timeskip 

            if (movement >= range) {
                return {
                    state: config.target
                }
            }

            return {
                state: point.state + movement * direction
            }
        }
    }
}
