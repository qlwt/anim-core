import { anim_new_line, anim_new_merge } from "#src/index.js"
import { assert, test } from "vitest"

const makeanim = (base: number, outputs: any[]) => {
    return anim_new_merge([
        anim_new_line({
            velocity: 1,
            target: base,

            effect(state) {
                outputs.push(`x: ${state}`)
            },
        }),

        anim_new_line({
            velocity: 1,
            target: base * 2,

            effect(state) {
                outputs.push(`y: ${state}`)
            },
        })
    ] as const)
}

test("merge anim by outputs", async () => {
    const expect = new Array()
    const outputs = new Array()

    const anim1 = makeanim(100, outputs)
    const anim2 = makeanim(200, outputs)

    await Promise.resolve([{ state: 0 }, { state: 0 }] as const)
        .then(point => {
            anim1.emit(point)

            expect.push("x: 0", "y: 0")

            return [point, anim1.step(point, 100)] as const
        })
        .then(([point_last, point_now]) => {
            anim1.emitdiff(point_last, point_now)

            expect.push("x: 100", "y: 100")

            return [point_now, anim1.step(point_now, 50)] as const
        })
        .then(([point_last, point_now]) => {
            anim1.emitdiff(point_last, point_now)

            // no difference for x
            expect.push("y: 150")

            return [point_now, anim2.step(point_now, 400)] as const
        })
        .then(([point_last, point_now]) => {
            anim2.emitdiff(point_last, point_now)

            expect.push("x: 200", "y: 400")

            outputs.push(anim2.finished(point_now))

            expect.push(true)
        })

    assert.deepStrictEqual(expect, outputs)
})
