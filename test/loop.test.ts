import { anim_new_line, anim_new_loop } from "#src/index.js"
import { assert, test } from "vitest"

const makeanim = (base: number, outputs: any[]) => {
    return anim_new_loop({
        point: {
            state: 0
        },

        src: anim_new_line({
            velocity: 1,
            target: base,

            effect(state) {
                outputs.push(state)
            },
        })
    })
}

test("loop anim by outputs", async () => {
    const outputs = new Array()
    const expect = new Array()

    const anim1 = makeanim(100, outputs)
    const anim2 = makeanim(200, outputs)

    await Promise.resolve({
        remaining: 2,

        child: {
            state: 0
        }
    })
        .then(point => {
            anim1.emit(point)

            expect.push(0)

            return [point, anim1.step(point, 50)] as const
        })
        .then(([point_last, point_now]) => {
            anim1.emitdiff(point_last, point_now)

            expect.push(50)

            return [point_now, anim1.step(point_now, 100)] as const
        })
        .then(([point_last, point_now]) => {
            // second iteration
            anim1.emitdiff(point_last, point_now)

            // will reset
            expect.push(0)

            return [point_now, anim1.step(point_now, 100)] as const
        })
        .then(([point_last, point_now]) => {
            // third iteration
            anim1.emitdiff(point_last, point_now)
            // no update as will reset to 0 again

            return [point_now, anim2.step(point_now, 150)] as const
        })
        .then(([point_last, point_now]) => {
            // last iteration
            anim2.emitdiff(point_last, point_now)

            expect.push(150)

            return [point_now, anim2.step(point_now, 100)] as const
        })
        .then(([point_last, point_now]) => {
            anim2.emitdiff(point_last, point_now)

            expect.push(200)

            outputs.push(anim2.finished(point_now))

            expect.push(true)
        })

    assert.deepStrictEqual(expect, outputs)
})
