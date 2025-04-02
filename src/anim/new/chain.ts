import type { Anim } from "#src/anim/type/Anim.js";

export type AnimChain_Point<ChildPoint> = {
    readonly ptr: number
    readonly child: ChildPoint
}

export const anim_new_chain = function <ChildPoint>(src: readonly Anim<ChildPoint>[]): Anim<AnimChain_Point<ChildPoint>> {
    return {
        finished(point) {
            return src.length === 0 || (
                point.ptr === src.length - 1
                && src[point.ptr]!.finished(point.child)
            )
        },

        emit(point) {
            if (src.length === 0) {
                return
            }

            src[point.ptr]!.emit(point.child)
        },

        emitdiff(from, to) {
            if (src.length === 0) {
                return
            }

            src[to.ptr]!.emitdiff(from.child, to.child)
        },

        step(point, timeskip) {
            if (src.length === 0) {
                return point
            }

            const activeanim = src[point.ptr]!
            const afterstep = activeanim.step(point.child, timeskip)

            if (activeanim.finished(afterstep)) {
                return {
                    child: afterstep,
                    ptr: Math.min(src.length - 1, point.ptr + 1)
                }
            }

            return {
                ...point,

                child: afterstep
            }
        },
    }
}
