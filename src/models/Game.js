export default class Game {

    static Unit = {
        EMPTY:  0,
        SPACE:  1,
        COIN:   2
    };

    static Direction = {
        TOP:    0,
        RIGHT:  1,
        DOWN:   2,
        LEFT:   3
    };

    #slime = {
        exist: false,
        row: null,
        col: null,
        direction: null
    };

    #title;
    #author;
    #cols;
    #rows;
    #map;

    #coinCount = 0;
    #score = 0;

    show() { console.log(this.#map); }

    constructor(a, b) {
        if (typeof a === 'number' && typeof b === 'number')
            this.#constructBySize(a, b);
        else if (typeof a === 'object')
            this.#constructByObject(a);
    }

    setSlime(row, col, direction) {
        if (this.#isOutOfMap(row, col))
            return;
        if (this.#map[row][col] === Game.Unit.COIN)
            this.#coinCount -= 1;
        this.#slime.exist = true;
        this.#slime.row = row;
        this.#slime.col = col;
        this.#slime.direction = direction;
        this.#map[row][col] = Game.Unit.SPACE;
    }

    setUnit(row, col, unit) {
        if (this.#isOutOfMap(row, col))
            return;
        if (unit === Game.Unit.COIN && this.#map[row][col] !== Game.Unit.COIN)
            this.#coinCount += 1;
        this.#map[row][col] = unit;
    }

    getRows() { return this.#rows; }

    getCols() { return this.#cols; }

    getScore() { return this.#score; }

    getTitle() { return this.#title; }

    getAuthor() { return this.#author; }

    getMap() { return this.#map; }

    getSlime() { return this.#slime; }

    isComplete() { return this.#score === this.#coinCount; }

    go() {
        if (!this.#slime.exist)
            return;
        else if (this.#slime.direction === Game.Direction.TOP)
            this.#to(this.#slime.row - 1, this.#slime.col);
        else if (this.#slime.direction === Game.Direction.RIGHT)
            this.#to(this.#slime.row, this.#slime.col + 1);
        else if (this.#slime.direction === Game.Direction.DOWN)
            this.#to(this.#slime.row + 1, this.#slime.col);
        else if (this.#slime.direction === Game.Direction.LEFT)
            this.#to(this.#slime.row, this.#slime.col - 1);
    }

    turnLeft() {
        if (this.#slime.direction === Game.Direction.TOP)
            this.#slime.direction = Game.Direction.LEFT;
        else if (this.#slime.direction === Game.Direction.RIGHT)
            this.#slime.direction = Game.Direction.TOP;
        else if (this.#slime.direction === Game.Direction.DOWN)
            this.#slime.direction = Game.Direction.RIGHT;
        else if (this.#slime.direction === Game.Direction.LEFT)
            this.#slime.direction = Game.Direction.DOWN;
    }

    turnRight() {
        if (this.#slime.direction === Game.Direction.TOP)
            this.#slime.direction = Game.Direction.RIGHT;
        else if (this.#slime.direction === Game.Direction.RIGHT)
            this.#slime.direction = Game.Direction.DOWN;
        else if (this.#slime.direction === Game.Direction.DOWN)
            this.#slime.direction = Game.Direction.LEFT;
        else if (this.#slime.direction === Game.Direction.LEFT)
            this.#slime.direction = Game.Direction.TOP;
    }

    #constructBySize(rows, cols) {
        this.#rows = rows;
        this.#cols = cols;
        this.#map = Array.from({ length: rows }, () => Array(cols).fill(Game.Unit.EMPTY));
    }

    #constructByObject(obj) {
        this.#constructBySize(obj.row_cnt, obj.col_cnt);
        obj.map.split('').forEach((c, i) => {
            this.setUnit(parseInt(i / this.#cols), i % this.#cols, parseInt(c));
        });
        this.#title = obj.title;
        this.#author = obj.author;
        this.setSlime(obj.slime_row, obj.slime_col, obj.slime_direction);
    }

    #isOutOfMap(row, col) {
        return row < 0 || row >= this.#rows || col < 0 || col >= this.#cols;
    }

    #to(row, col) {
        if (this.#isOutOfMap(row, col))
            return;
        if (this.#map[row][col] == Game.Unit.EMPTY)
            return;
        if (this.#map[row][col] == Game.Unit.COIN)
            this.#score += 1;
        this.#map[row][col] = Game.Unit.SPACE;
        this.#slime.row = row;
        this.#slime.col = col;
    }

}
