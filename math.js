class Vector2 {

    #x = 0;

    #y = 0;

    constructor(x = 0, y = 0) {
        this.#x = x;
        this.#y = y;
    }

    static zero() {
        return new Vector2(0, 0);
    }

    static of(x, y) {
        return new Vector2(x, y);
    }

    static ofX(x) {
        return new Vector2(x, 0);
    }

    static ofY(x) {
        return new Vector2(0, y);
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    add(vector) {
        return Vector2.of(this.#x + vector.x, this.#y + vector.y);
    }

    subtract(vector) {
        return Vector2.of(this.#x - vector.x, this.#y - vector.y);
    }

    multiply(scalar) {
        return Vector2.of(this.#x * scalar, this.#y * scalar);
    }

    divide(scalar) {
        if (scalar === 0) {
            throw new Error("Cannot divide by zero");
        }
        
        return Vector2.of(this.#x / scalar, this.#y / scalar);
    }

    length() {
        return Math.sqrt(this.#x * this.#x + this.#y * this.#y);
    }

    normalize() {
        const len = this.length();
        if (len === 0) {
            return Vector2.zero();
        }

        return this.divide(len);
    }

    dot(vector) {
        return this.#x * vector.x + this.#y * vector.y;
    }

    distanceTo(vector) {
        const dx = this.#x - vector.x;
        const dy = this.#y - vector.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    toString() {
        return `(${this.#x}, ${this.#y})`;
    }

    equals(vector) {
        return this.#x === vector.x && this.#y === vector.y;
    }
}
