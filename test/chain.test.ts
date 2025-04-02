import { anim_new_chain, anim_new_line } from "#src/index.js"
import { assert, test } from "vitest"

const makeanim = (base: number, outputs: any[]) => {
    return anim_new_chain([
        anim_new_line({
            target: base,
            velocity: 1,

            effect(state) {
                outputs.push(`x: ${state}`)
            },
        }),

        anim_new_line({
            target: -base,
            velocity: 2,

            effect(state) {
                outputs.push(`y: ${state}`)
            },
        })
    ] as const)
}

test("chain anim by outputs", async () => {
    const outputs = new Array()
    const expect = new Array()

    const anim1 = makeanim(100, outputs)
    const anim2 = makeanim(200, outputs)

    await Promise.resolve({
        ptr: 0,
        child: { state: 0 }
    })
        .then(point => {
            anim1.emit(point)

            expect.push("x: 0")

            return [point, anim1.step(point, 50)] as const
        })
        .then(([point_last, point_now]) => {
            anim1.emitdiff(point_last, point_now)

            expect.push("x: 50")

            return [point_now, anim1.step(point_now, 150)] as const
        })
        .then(([point_last, point_now]) => {
            anim1.emitdiff(point_last, point_now)

            // should cap at finish of first animation and increase activeindex
            expect.push("y: 100")

            return [point_now, anim1.step(point_now, 25)] as const
        })
        .then(([point_last, point_now]) => {
            anim1.emitdiff(point_last, point_now)

            expect.push("y: 50")

            return [point_now, anim2.step(point_now, 100)] as const
        })
        .then(([point_last, point_now]) => {
            anim2.emitdiff(point_last, point_now)

            expect.push("y: -150")

            return [point_now, anim2.step(point_now, 100)] as const
        })
        .then(([point_last, point_now]) => {
            anim2.emitdiff(point_last, point_now)

            expect.push("y: -200")

            outputs.push(anim2.finished(point_now), point_now.ptr)

            expect.push(true, 1)
        })

    assert.deepStrictEqual(outputs, expect)
})
