import type { Anim } from "#src/anim/type/Anim.js";
import type { Anim_InferPoint } from "#src/anim/type/Anim_InferPoint.js";

export type AnimMergeMap_Point<ChildPoints extends { [K in keyof any]: any }> = {
    +readonly [K in keyof ChildPoints]: ChildPoints[K]
}

type Src_Generic = {
    readonly [K in keyof any]: Anim
}

type Src_PointMerge<Src extends Src_Generic> = AnimMergeMap_Point<{
    [K in keyof Src]: Anim_InferPoint<Src[K]>
}>

type Src_AnimMerge<Src extends Src_Generic> = Anim<Src_PointMerge<Src>>

export const anim_new_mergemap = function <Src extends Src_Generic>(src: Src): Src_AnimMerge<Src> {
    return {
        finished(point) {
            return Object.keys(src).every(key => {
                return src[key]!.finished(point[key]!)
            })
        },

        emit(point) {
            Object.keys(src).forEach(key => {
                src[key]!.emit(point[key])
            })
        },

        emitdiff(from, to) {
            Object.keys(src).forEach(key => {
                src[key]!.emitdiff(from[key], to[key])
            })
        },

        step(point, timeskip) {
            return Object.fromEntries(Object.entries(src).map(
                ([key, src_anim]) => {
                    return [key, src_anim.step(point[key], timeskip)]
                }
            )) as Src_PointMerge<Src>
        }
    }
}
