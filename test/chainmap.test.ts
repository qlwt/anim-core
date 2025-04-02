import { anim_new_chainmap, anim_new_line } from "#src/index.js"
import { assert, test } from "vitest"

const makeanim = (base: number, outputs: any[]) => {
    return anim_new_chainmap([
        {
            a: anim_new_line({
                target: base,
                velocity: 1,

                effect(state) {
                    outputs.push(`x: ${state}`)
                },
            })
        },
        {
            b: anim_new_line({
                target: base,
                velocity: 1,

                effect(state) {
                    outputs.push(`y: ${state}`)
                },
            })
        },
        {
            a: anim_new_line({
                target: -base,
                velocity: 1,

                effect(state) {
                    outputs.push(`z: ${state}`)
                },
            })
        },
    ] as const)
}

test("chainmap anim by outputs", async () => {
    const outputs = new Array()
    const expect = new Array()

    const anim1 = makeanim(100, outputs)
    const anim2 = makeanim(200, outputs)

    await Promise.resolve({
        ptr: 0,

        children: {
            a: {
                state: 0
            },

            b: {
                state: 0
            }
        }
    } as const)
        .then(point => {
            anim1.emit(point)

            expect.push("x: 0", "y: 0")

            return [point, anim1.step(point, 50)] as const
        })
        .then(([point_last, point_now]) => {
            anim1.emitdiff(point_last, point_now)

            expect.push("x: 50")

            return [point_now, anim1.step(point_now, 100)] as const
        })
        .then(([point_last, point_now]) => {
            anim1.emitdiff(point_last, point_now)

            expect.push("x: 100")

            return [point_now, anim1.step(point_now, 50)] as const
        })
        .then(([point_last, point_now]) => {
            anim1.emitdiff(point_last, point_now)

            expect.push("y: 50")

            return [point_now, anim2.step(point_now, 100)] as const
        })
        .then(([point_last, point_now]) => {
            anim2.emitdiff(point_last, point_now)

            expect.push("x: 200", "y: 150")

            return [point_now, anim2.step(point_now, 100)] as const
        })
        .then(([point_last, point_now]) => {
            anim2.emitdiff(point_last, point_now)

            expect.push("y: 200")

            return [point_now, anim2.step(point_now, 100)] as const
        })
        .then(([point_last, point_now]) => {
            anim2.emitdiff(point_last, point_now)

            expect.push("z: 100")

            return [point_now, anim2.step(point_now, 500)] as const
        })
        .then(([point_last, point_now]) => {
            anim2.emitdiff(point_last, point_now)

            expect.push("z: -200")

            outputs.push(anim2.finished(point_now))

            expect.push(true)
        })

    assert.deepStrictEqual(outputs, expect)
})
