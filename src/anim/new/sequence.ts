import type { Anim } from "#src/anim/type/Anim.js"
import type { Anim_InferPoint } from "#src/anim/type/Anim_InferPoint.js"

export type AnimSequence_Point<ChildPoints extends readonly any[]> = {
    readonly mergeptr: number
    readonly children: ChildPoints
}

type Src_Generic = readonly Anim[]

type Src_Children<Src extends Src_Generic> = {
    +readonly [K in keyof Src]: Anim_InferPoint<Src[K]>
}

type Src_PointSequence<Src extends Src_Generic> = AnimSequence_Point<Src_Children<Src>>

export const anim_new_sequence = function <Src extends Src_Generic>(
    src: Src
): Anim<Src_PointSequence<Src>> {
    return {
        finished(point) {
            return point.children.every(
                (childpoint, index) => src[index]!.finished(childpoint)
            )
        },

        emit(point) {
            for (let i = src.length - 1; i > point.mergeptr; --i) {
                src[i]!.emit(point.children[i]!)
            }

            for (let i = 0; i <= point.mergeptr; ++i) {
                src[i]!.emit(point.children[i]!)
            }
        },

        emitdiff(from, to) {
            for (let i = src.length - 1; i > to.mergeptr; --i) {
                src[i]!.emitdiff(from.children[i]!, to.children[i]!)
            }

            for (let i = 0; i <= to.mergeptr; ++i) {
                src[i]!.emitdiff(from.children[i]!, to.children[i]!)
            }
        },

        step(point, timeskip) {
            let stepdone = true
            const afterstep_childpoints = []

            for (let i = 0; i <= point.mergeptr; ++i) {
                const i_anim = src[i]!
                const i_point = point.children[i]!
                const i_point_next = i_anim.step(i_point, timeskip)

                afterstep_childpoints.push(i_point_next)

                if (!i_anim.finished(i_point_next)) {
                    stepdone = false
                }
            }

            for (let i = point.mergeptr + 1; i < src.length; ++i) {
                afterstep_childpoints.push(point.children[i]!)
            }

            return {
                children: afterstep_childpoints as Src_Children<Src>,
                mergeptr: Math.min(point.mergeptr + Number(stepdone), src.length - 1)
            }
        },
    }
}
