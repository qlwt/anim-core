import type { Anim } from "#src/anim/type/Anim.js";
import type { Anim_InferPoint } from "#src/anim/type/Anim_InferPoint.js";

type UnionKeyof<T extends Object> = (T extends T
    ? keyof T
    : never
)

type UnionValue<T extends Object, K extends keyof any> = (T extends { [key in K]: infer O }
    ? O
    : never
)

type Src_Generic = readonly {
    readonly [K in keyof any]: Anim<any>
}[]

type Src_PointChainMap_Children<Src extends Src_Generic> = {
    +readonly [K in UnionKeyof<Src[number]>]: Anim_InferPoint<UnionValue<Src[number], K>>
}

type Src_PointChainMap<Src extends Src_Generic> = AnimChainMap_Point<Src_PointChainMap_Children<Src>>

export type AnimChainMap_Point<Children extends { readonly [K in keyof any]: any }> = {
    readonly ptr: number
    readonly children: Children
}

export const anim_new_chainmap = function <Src extends Src_Generic>(src: Src): Anim<Src_PointChainMap<Src>> {
    const activeanim = (index: number, key: UnionKeyof<Src[number]>) => {
        for (let i = index; i >= 0; --i) {
            if (src[i]![key]) {
                return src[i]![key]
            }
        }
    }

    return {
        finished(point) {
            if (src.length === 0) {
                return true
            }

            if (point.ptr !== src.length - 1) {
                return false
            }

            for (const key in point.children) {
                const key_point = point.children[key as UnionKeyof<Src[number]>]
                const key_activeanim = activeanim(point.ptr, key as UnionKeyof<Src[number]>)!

                if (!key_activeanim.finished(key_point)) {
                    return false
                }
            }

            return true
        },

        emit(point) {
            if (src.length === 0) {
                return
            }

            for (const key in point.children) {
                const key_point = point.children[key as UnionKeyof<Src[number]>]
                const key_activeanim = activeanim(point.ptr, key as UnionKeyof<Src[number]>)

                // emit activeanim for key if present, else - emit first inactive anim
                if (key_activeanim) {
                    key_activeanim.emit(key_point)
                } else {
                    for (let i = point.ptr + 1; i < src.length - 1; ++i) {
                        const i_animmap = src[i]!
                        const key_srcanim = i_animmap[key]

                        if (key_srcanim) {
                            key_srcanim.emit(key_point)
                        }
                    }
                }
            }
        },

        emitdiff(from, to) {
            if (src.length === 0) {
                return
            }

            for (const key in to.children) {
                const key_activeanim = activeanim(to.ptr, key as UnionKeyof<Src[number]>)

                const to_key_point = to.children[key as UnionKeyof<Src[number]>]
                const from_key_point = from.children[key as UnionKeyof<Src[number]>]

                key_activeanim?.emitdiff(from_key_point, to_key_point)
            }
        },

        step(point, timeskip) {
            if (src.length === 0) {
                return point
            }

            const afterstep = {} as Partial<Src_PointChainMap_Children<Src>>

            for (const key in point.children) {
                const key_point = point.children[key as UnionKeyof<Src[number]>]
                const key_activeanim = activeanim(point.ptr, key as UnionKeyof<Src[number]>)

                if (key_activeanim) {
                    afterstep[key as UnionKeyof<Src[number]>] = key_activeanim.step(key_point, timeskip)
                } else {
                    afterstep[key as UnionKeyof<Src[number]>] = point.children[key as UnionKeyof<Src[number]>]
                }
            }

            for (const key in afterstep) {
                const key_point = afterstep[key as UnionKeyof<Src[number]>]
                const key_activeanim = activeanim(point.ptr, key as UnionKeyof<Src[number]>)

                if (key_activeanim && !key_activeanim.finished(key_point)) {
                    return {
                        ...point,

                        children: afterstep as Src_PointChainMap_Children<Src>
                    }
                }
            }

            return {
                ptr: Math.min(point.ptr + 1, src.length - 1),
                children: afterstep as Src_PointChainMap_Children<Src>
            }
        }
    }
}
