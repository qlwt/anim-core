import { anim_new_sequence_strict } from "#src/anim/new/sequence_strict.js"
import { anim_new_line, type Anim_InferPoint } from "#src/index.js"
import { assert, test } from "vitest"

const seq = (base: number, outputs: Array<any>) => {
    return anim_new_sequence_strict([
        anim_new_line({
            effect(state) {
                outputs.push(`x: ${state}`)
            },

            target: base,
            velocity: 1
        }),

        anim_new_line({
            effect(state) {
                outputs.push(`y: ${state}`)
            },

            target: -base,
            velocity: 1
        })
    ] as const)
}

test("anim_new_sequence_strict by outputs", async () => {
    const outputs = new Array()
    const expect = new Array()

    const anima = seq(100, outputs)
    const animb = seq(-100, outputs)

    // no async logic, just easy chaining with .then
    await Promise.resolve({
        children: [
            { state: 0 },
            { state: 0 },
        ] as const
    } satisfies Anim_InferPoint<typeof anima>)
        .then(point => {
            anima.emit(point)

            // later sequence children emit first
            expect.push("y: 0", "x: 0")

            return [point, anima.step(point, 100)] as const
        })
        .then(([point_last, point_now]) => {
            anima.emitdiff(point_last, point_now)

            expect.push("x: 100")

            return [point_now, anima.step(point_now, 50)] as const
        })
        .then(([point_last, point_now]) => {
            anima.emitdiff(point_last, point_now)

            // not loging x: 100 again because emitdiff
            expect.push("y: -50")

            // continuing with animb
            return [point_now, animb.step(point_now, 50)] as const
        })
        .then(([point_last, point_now]) => {
            animb.emitdiff(point_last, point_now)

            // no merge, emit x first
            // not logging y because of emitdiff
            expect.push("x: 50")

            return [point_now, animb.step(point_now, 200)] as const
        })
        .then(([point_last, point_now]) => {
            animb.emitdiff(point_last, point_now)

            // finish x
            expect.push("x: -100")

            return [point_now, animb.step(point_now, 200)] as const
        })
        .then(([point_last, point_now]) => {
            animb.emitdiff(point_last, point_now)

            // finish animation
            expect.push("y: 100")

            outputs.push(animb.finished(point_now))

            expect.push(true)
        });

    console.dir(outputs, { depth: Infinity })

    assert.deepStrictEqual(outputs, expect)
})
