import type { Anim } from "#src/anim/type/Anim.js";
import type { FrameScheduler } from "#src/scheduler/type/FrameScheduler.js";

export type EmitterInterval<Point> = {
    readonly point: () => Point
    readonly active: () => boolean

    readonly hardstop: () => void
    readonly softstop: () => void
}

export type EmitterNewInterval_Params<Point> = {
    readonly point: Point
    readonly anim: Anim<Point>
    readonly scheduler: FrameScheduler
    readonly batch?: null | ((callback: VoidFunction) => void)
}

export const emitter_new_interval = function <Point>(params: EmitterNewInterval_Params<Point>): EmitterInterval<Point> {
    const { anim, scheduler, batch } = params

    let last_point = params.point
    let last_time = scheduler.time_init()
    let cleanup: VoidFunction | undefined

    if (batch) {
        batch(() => {
            anim.emit(last_point)
        })
    } else {
        anim.emit(last_point)
    }

    const update = (now_time: number): void => {
        const timepassed = now_time - last_time
        const now_point = anim.step(last_point, timepassed)

        if (batch) {
            batch(() => {
                anim.emitdiff(last_point, now_point)
            })
        } else {
            anim.emitdiff(last_point, now_point)
        }

        {
            last_time = now_time
            last_point = now_point
        }
    }

    const framecb: FrameRequestCallback = timenow => {
        update(timenow)

        {
            if (anim.finished(last_point)) {
                cleanup = undefined

                return
            }

            {
                cleanup = scheduler.request(framecb)
            }
        }
    }

    cleanup = scheduler.request(framecb)

    return {
        point: () => {
            return last_point
        },

        active: () => {
            return typeof cleanup === "function"
        },

        softstop: () => {
            if (cleanup) {
                cleanup()
                cleanup = undefined

                update(performance.now())
            }
        },

        hardstop: () => {
            if (cleanup) {
                cleanup()
                cleanup = undefined
            }
        }
    }
}
