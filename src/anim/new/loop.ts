import type { Anim } from "#src/anim/type/Anim.js"

export type AnimLoop_Point<ChildPoint> = {
    readonly remaining: number
    readonly child: ChildPoint
}

export type AnimLoop_Params<ChildPoint> = {
    readonly point: ChildPoint
    readonly src: Anim<ChildPoint>
}

export const anim_new_loop = function <ChildPoint>(config: AnimLoop_Params<ChildPoint>): Anim<AnimLoop_Point<ChildPoint>> {
    return {
        finished(point) {
            return point.remaining <= 0 && config.src.finished(point.child)
        },

        emit(point) {
            config.src.emit(point.child)
        },

        emitdiff(from, to) {
            config.src.emitdiff(from.child, to.child)
        },

        step(point, timeskip) {
            const afterstep = config.src.step(point.child, timeskip)

            if (point.remaining > 0 && config.src.finished(afterstep)) {
                return {
                    child: config.point,
                    remaining: point.remaining - 1
                }
            }

            return {
                child: afterstep,
                remaining: point.remaining
            }
        }
    }
}
