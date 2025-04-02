import type { Anim } from "#src/anim/type/Anim.js"
import type { Anim_InferPoint } from "#src/anim/type/Anim_InferPoint.js"

export type AnimSequenceStrict_Point<ChildPoints extends readonly any[]> = {
    readonly children: ChildPoints
}

type Src_Generic = readonly Anim[]

type Src_Children<Src extends Src_Generic> = {
    +readonly [K in keyof Src]: Anim_InferPoint<Src[K]>
}

type Src_SequenceStrictPoint<Src extends Src_Generic> = AnimSequenceStrict_Point<Src_Children<Src>>

export const anim_new_sequence_strict = function <Src extends Src_Generic>(src: Src): Anim<Src_SequenceStrictPoint<Src>> {
    return {
        finished(point) {
            return point.children.every(
                (childpoint, index) => src[index]!.finished(childpoint)
            )
        },

        emit(point) {
            // find active index
            let i = 0

            for (; i < src.length; ++i) {
                const anim = src[i]!
                const child = point.children[i]!

                if (anim.finished(child)) {
                    continue
                }

                break
            }

            // i is first not done element

            // all animations are done
            if (i >= src.length) {
                for (let j = src.length - 1; j >= 0; --j) {
                    const anim = src[j]!
                    const child = point.children[j]!

                    anim.emit(child)
                }

                return
            }

            // undone animation in the middle
            {
                // emit latter first so they will be overriden
                for (let j = src.length - 1; j > i; --j) {
                    const anim = src[j]!
                    const child = point.children[j]!

                    anim.emit(child)
                }

                // emit in order so latter overrides earlier
                for (let j = 0; j <= i; ++j) {
                    const anim = src[j]!
                    const child = point.children[j]!

                    anim.emit(child)
                }
            }
        },

        emitdiff(from, to) {
            // find active index
            let i = 0

            for (; i < src.length; ++i) {
                const anim = src[i]!
                const child_from = from.children[i]!

                if (anim.finished(child_from)) {
                    continue
                }

                break
            }

            // i is first not done element

            // all animations are done
            if (i >= src.length) {
                for (let j = src.length - 1; j >= 0; --j) {
                    const anim = src[j]!
                    const child_to = to.children[j]!
                    const child_from = from.children[j]!

                    anim.emitdiff(child_from, child_to)
                }

                return
            }

            // undone animation in the middle
            {
                // emit latter first so they will be overriden
                for (let j = src.length - 1; j > i; --j) {
                    const anim = src[j]!
                    const child_to = to.children[j]!
                    const child_from = from.children[j]!

                    anim.emitdiff(child_from, child_to)
                }

                // emit in order so latter overrides earlier
                for (let j = 0; j <= i; ++j) {
                    const anim = src[j]!
                    const child_to = to.children[j]!
                    const child_from = from.children[j]!

                    anim.emitdiff(child_from, child_to)
                }
            }
        },

        step(point, timeskip) {
            let i = 0

            const next_children = []

            for (; i < src.length; ++i) {
                const anim = src[i]!
                const child = point.children[i]!

                if (anim.finished(child)) {
                    next_children.push(child)

                    continue
                }

                {
                    next_children.push(anim.step(child, timeskip))

                    break
                }
            }

            for (i += 1; i < src.length; ++i) {
                next_children.push(point.children[i]!)
            }

            return {
                children: next_children as Src_Children<Src>
            }
        },
    }
}
