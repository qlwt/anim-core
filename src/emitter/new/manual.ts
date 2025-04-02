import type { Anim } from "#src/anim/type/Anim.js"

export type EmitterManual<Point> = {
    readonly point: () => Point
    readonly finished: () => boolean
    readonly step: (timepassed: number) => void
}

export type EmitterManual_Params<Point> = {
    readonly point: Point
    readonly anim: Anim<Point>
    readonly batch?: null | ((callback: VoidFunction) => void)
}

export const emitter_new_manual = function <Point>(params: EmitterManual_Params<Point>): EmitterManual<Point> {
    let last_point = params.point

    const { anim, batch } = params

    if (batch) {
        batch(() => {
            anim.emit(last_point)
        })
    } else {
        anim.emit(last_point)
    }

    return {
        point: () => {
            return last_point
        },

        finished: () => {
            return anim.finished(last_point)
        },

        step: (timepassed) => {
            const now_point = anim.step(last_point, timepassed)

            if (batch) {
                batch(() => {
                    anim.emitdiff(last_point, now_point)
                })
            } else {
                anim.emitdiff(last_point, now_point)
            }

            {
                last_point = now_point
            }
        }
    }
}
