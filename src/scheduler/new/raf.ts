import type { FrameScheduler } from "#src/scheduler/type/FrameScheduler.js";

type PerformanceMock = {
    readonly now: () => number
}

type RequestFn = {
    (framecb: (timenow: number) => void): number
}

type CancelFn = {
    (id: number): void
}

export const fscheduler_new_frame = function(
    performance: PerformanceMock, request: RequestFn, cancel: CancelFn
): FrameScheduler {
    return {
        time_init: () => performance.now(),

        request: framecb => {
            const id = request(() => {
                framecb(performance.now())
            })

            return () => {
                cancel(id)
            }
        }
    }
}
