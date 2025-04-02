export type FrameScheduler = {
    readonly time_init: () => number
    readonly request: (callback: (now_time: number) => void) => VoidFunction
}
