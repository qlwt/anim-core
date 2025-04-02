import type { Anim } from "#src/anim/type/Anim.js"
import * as spring from "@qyu/spring"

export type AnimSpring_Point = {
    readonly state: number
    readonly velocity: number
}

export type AnimNewSpring_Config = {
    /** higher frequency - faster animation */
    readonly natfreq: number
    /** higher damping ratio - more damping. */
    readonly dampratio: number
    readonly target: number
    readonly effect: (state: number, velocity: number) => void

    /** animation will end when all conditions are met */
    readonly precision?: {
        /** minimal velocity - default is 0.01 */
        readonly velocity?: number
        /** minimal displacement - default is 0.1 */
        readonly displacement?: number
    }
}

export const anim_new_spring = (config: AnimNewSpring_Config): Anim<AnimSpring_Point> => {
    const {
        precision: {
            velocity: precision_velocity = 1e-2,
            displacement: precision_displacement = 1e-1
        } = {}
    } = config

    return {
        emit(point) {
            config.effect(point.state, point.velocity)
        },

        emitdiff(from, to) {
            if (from.state !== to.state || from.velocity !== to.velocity) {
                config.effect(to.state, to.velocity)
            }
        },

        finished(point) {
            return (point.state === config.target && point.velocity === 0)
        },

        step(point, timeskip) {
            const springconfig: spring.SpringConfig = {
                drive: point.velocity,
                dampratio: config.dampratio,
                natfreq: config.natfreq,
                displacement: point.state - config.target
            }

            const velocity = spring.velocity(springconfig, timeskip)
            const displacement = spring.displacement(springconfig, timeskip)

            if (
                Math.abs(velocity) < precision_velocity
                && Math.abs(displacement) < precision_displacement
            ) {
                return {
                    velocity: 0,
                    state: config.target,
                }
            }

            return {
                velocity,

                state: config.target + displacement
            }
        }
    }
}
