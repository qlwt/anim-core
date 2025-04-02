import type { Anim } from "#src/anim/type/Anim.js";
import type { Anim_InferPoint } from "#src/anim/type/Anim_InferPoint.js";

export type AnimMerge_Point<ChildPoints extends readonly any[]> = {
    +readonly [K in keyof ChildPoints]: ChildPoints[K]
}

type Src_Generic = readonly Anim[]

type Src_PointMerge<Src extends Src_Generic> = AnimMerge_Point<{
    [K in keyof Src]: Anim_InferPoint<Src[K]>
}>

type Src_AnimMerge<Src extends Src_Generic> = Anim<Src_PointMerge<Src>>

export const anim_new_merge = function <Src extends Src_Generic>(src: Src): Src_AnimMerge<Src> {
    return {
        finished(point) {
            return point.every((point_item, index) => {
                return src[index]!.finished(point_item)
            })
        },

        emit(point) {
            point.forEach((point_item, index) => {
                src[index]!.emit(point_item)
            })
        },

        emitdiff(from, to) {
            to.forEach((to_item, index) => {
                src[index]!.emitdiff(from[index]!, to_item)
            })
        },

        step(point, timeskip) {
            return point.map(
                (point_item, index) => src[index]!.step(point_item, timeskip)
            ) as Src_PointMerge<Src> 
        }
    }
}
