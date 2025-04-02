export type Anim<Point = any> = {
    finished(point: Point): boolean
    emit(point: Point): void
    emitdiff(from: Point, to: Point): void
    step(point: Point, timeskip: number): Point
}
