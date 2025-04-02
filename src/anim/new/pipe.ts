import type { Anim } from "#src/anim/type/Anim.js";

export type AnimNewPipe_InputPipe<PointSrc, PointOut> = {
    (point_input: PointOut): PointSrc
}

export type AnimNewPipe_OutputPipe<PointSrc, PointOut> = {
    (point_src: PointSrc): PointOut
}

export type AnimNewPipe_Config<PointSrc, PointOut> = {
    readonly pipei: AnimNewPipe_InputPipe<PointSrc, PointOut>
    readonly pipeo: AnimNewPipe_OutputPipe<PointSrc, PointOut>
}

export type AnimNewPipe_Params<PointSrc, PointOut> = {
    readonly src: Anim<PointSrc>
    readonly config: AnimNewPipe_Config<PointSrc, PointOut>
}

export const anim_new_pipe = function <PointSrc, PointOut>(params: AnimNewPipe_Params<PointSrc, PointOut>): Anim<PointOut> {
    const { src, config } = params

    return {
        finished: point => {
            return src.finished(config.pipei(point))
        },

        emit: point => {
            return src.emit(config.pipei(point))
        },

        emitdiff: (point_from, point_to) => {
            return src.emitdiff(config.pipei(point_from), config.pipei(point_to))
        },

        step: (point, timepassed) => {
            return config.pipeo(src.step(config.pipei(point), timepassed))
        },
    }
}
