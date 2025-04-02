# @qyu/anim-core

Animation definition and implementation

## Definitions

```typescript
// animation does not hold state or progress, instead it's exported as <Point>
// animation also does not specify initial point
type Anim<Point> = {
    // is animation finished in the point
    finished(point: Point): boolean
    // emit animation in point
    emit(point: Point): void
    // emit difference between points
    emitdiff(point_from: Point, point_to: Point): void
    // progress point by specified amount of abstract time units
    step(point: Point, timepassed: number): void
}
```

## Implemented Animations

### Linear Animation

```typescript
// linear animation
// initial position is passed in initial point
const line = anim_new_line({
    target: 50,
    // positive number, speed of displacement decline
    velocity: 0.1,
    // will be called on .emit
    effect(state) {
        console.log("linear animation", { state })
    }
})

const line_point = {
    state: 0
} as const
```

### Spring Animation

```typescript
// harmonic damped oscillator
// initial position and drive is passed in initial point
const spring = anim_new_spring({
    target: 100,
    natfreq: 0.01,
    dampratio: 0.6,

    // end conditions
    // precision is optional, theese are default values
    // end if Math.abs(velocity) <= precision.velocity and displacement < precision.displacement
    precision: {
        velocity: 0.001,
        displacement: 0.01
    },

    // will be called on .emit
    effect(state, velocity) {
        console.log("spring animation", { state, velocity })
    }
})

const spring_point = {
    state: -50,
    velocity: 10
} as const
```

### Playback Animation Modifier

```typescript
// will multiply timepassed by 2 on .step function
const fastspring = anim_new_playback({
    src: spring,
    multiplier: 2
})
```

### Sequence Animation

```typescript
// spring will be emitted after line
// initial .emit will also activate effect for spring, it won't call in futher in .emitdiff
// overshoot is always ignored, so sequence.step(initpoint, 1000000) will only pass line animation
const sequence = anim_new_sequence([line, spring] as const)

const sequence_point = {
    // all animations of index <= mergeptr will be merged into one
    // will increase as animation progressess
    // imagine you have sequence of 3 linear animations with targets of [100, 50, 20]
    // as animation progresses towards second child,
    // conditions change and you now want to pass the same state to different path [150, 20, 40]
    // because of merge - it will emit first and second animation simultaniously
    // so both first and second lines will be moving towards corrected targets
    mergeptr: 0,
    children: [line_point, spring_point] as const
} as const
```

### Strict Sequence Animation

```typescript
// same as sequence, just does not merge animations on update
const sequence_strict = anim_new_sequence_strict([line, spring] as const)

const sequence_strict_point = {
    children: [line_point, spring_point] as const
} as const
```

### Merge Animation

```typescript
// animations will be moving simultaniously
const merge = anim_new_merge([line, spring] as const)
const mergemap = anim_new_mergemap({ line, spring } as const)

const merge_point = [line_point, spring_point] as const
const mergemap_point = { line: line_point, spring: spring_point } as const
```

### Loop Animation

```typescript
// will go to the end, then restart
const loop = anim_new_loop({
    src: line,
    // point that loop will be using to restart
    initpoint: line_point
})

const loop_point = {
    // when animation ends, will restart and decrease if remaining > 0
    // will do first iteration regardless
    remaining: 1,
    child: line_point
} as const
```

### Pipe Animation Modifier

```typescript
// make line compatible with spring point
const line_piped = anim_new_pipe<AnimLine_Point, AnimSpring_Point>({
    src: line,

    pipei: point_src => ({
        state: point_src.state
    }),

    pipeo: point_input => ({
        state: point_input.state,
        velocity: 0.1
    })
})
```

### Chain Animation

```typescript
// unlike sequence, children of chain share the same point, so they need to be compatible
// will execute line animation, then will give final point of it to spring animation
// if you try to update the path such as you would do with sequence - it won't reemit processed animations
const chain = anim_new_chain([line_piped, spring] as const)

const chain_point = {
    // index of active animation
    ptr: 0,
    // shared point
    child: spring_point
} as const
```

### ChainMap Animation

```typescript
// basically chain with threads
// animations that share thread share point
// will emit spring, then line, then line_piped using spring's point
// points should be compatible inside of the single thread
// if you're emitting line animation (index 1), and want to pass point to a different path with updated spring
// it will merge spring and line animation into one
const chainmap = anim_new_chainmap([
    { a: spring } as const,
    { b: line } as const,
    { a: line_piped } as const
] as const)

const chainmap_point = {
    // index of active element
    ptr: 0,

    children: {
        b: line_point,
        a: spring_point,
    } as const
} as const
```

## Implemented Animation Emitters

### Interval Emitter
```typescript
// definition
type EmitterInterval<Point> = {
    // get current point
    point(): Point
    // is emitter still active
    active(): boolean
    // interrupt
    hardstop(): void
    // update according to current time and interrupt
    softstop(): void
}

// Frame Scheduler is api for scheduling frames
const fscheduler_node = fscheduler_new_frame(Date, setTimeout, clearTimeout)
const fscheduler_browser = fscheduler_new_frame(performance, requestAnimationFrame, cancelAnimationFrame)

// emits animation immediately, then emits difference each animation frame until finish
const controls_frame = emitter_new_interval({
    anim: line,
    point: line_point,
    scheduler: fscheduler_node,

    // optional, wraps anim emittment
    batch: cb => cb()
})
```

### Manual Emitter

```typescript
// controls for manual emitter
type EmitterManual<Point> = {
    // get current point
    point(): Point
    // is animation finished
    finished(): boolean
    // make a step
    step(timepassed: number): void
}

// emits animation immediately, then emits difference each time .step is called
const controls_manual = emitter_new_manual({
    anim: line,
    point: line_point,

    // optional, wraps anim emittment
    batch: cb => cb()
})
```
