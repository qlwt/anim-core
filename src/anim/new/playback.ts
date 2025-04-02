import type { Anim } from "#src/anim/type/Anim.js";

export type AnimNewPlayback_Params<Point> = {
    readonly src: Anim<Point>
    readonly config: AnimNewPlayback_Config
}

export type AnimNewPlayback_Config = {
    readonly multiplier: number
}

export const anim_new_playback = function <Point>(params: AnimNewPlayback_Params<Point>): Anim<Point> {
    return {
        finished: point => {
            return params.src.finished(point)
        },

        emit: point => {
            return params.src.emit(point)
        },

        emitdiff: (point_from, point_to) => {
            return params.src.emitdiff(point_from, point_to)
        },

        step: (point, timepassed) => {
            return params.src.step(point, timepassed * params.config.multiplier)
        }
    }
}
