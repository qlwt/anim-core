import type { Anim } from "#src/anim/type/Anim.js";

export type Anim_InferPoint<
    Src extends Anim<any>
> = Src extends Anim<infer P> ? P : never
