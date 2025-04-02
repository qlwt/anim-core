import { anim_new_line, type AnimLine_Point } from "#src/index.js"
import { assert, test } from "vitest"

test("animation line by outputs", async () => {
    const expect = new Array()
    const outputs = new Array()

    const anima = anim_new_line({
        target: 100,
        velocity: 1,
        effect: outputs.push.bind(outputs)
    })

    const animb = anim_new_line({
        target: 0,
        velocity: 5,
        effect: outputs.push.bind(outputs)
    })

    await Promise.resolve<AnimLine_Point>({ state: 0 })
        .then(point => {
            anima.emit(point)

            expect.push(0)

            return [point, anima.step(point, 10)] as const
        })
        .then(([point_last, point_now]) => {
            anima.emitdiff(point_last, point_now)

            expect.push(10)

            return [point_now, anima.step(point_now, 5)] as const
        })
        .then(([point_last, point_now]) => {
            anima.emitdiff(point_last, point_now)

            expect.push(15)

            return [point_now, animb.step(point_now, 1)] as const
        })
        .then(([point_last, point_now]) => {
            animb.emitdiff(point_last, point_now)

            expect.push(10)

            return [point_now, anima.step(point_now, 5)] as const
        })
        .then(([point_last, point_now]) => {
            animb.emitdiff(point_last, point_now)

            expect.push(15)

            return [point_now, anima.step(point_now, 100)] as const
        })
        .then(([point_last, point_now]) => {
            anima.emitdiff(point_last, point_now)

            outputs.push(anima.finished(point_now))

            expect.push(100, true)
        })

    assert.deepStrictEqual(outputs, expect)
})
