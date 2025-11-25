export default class Cursor {
    constructor(options ={}) {
        this.radio = options.radio || 50;
        this.friction = options.friction || 0.1;
        this.pos = null;

    }

    setup() {
        this.pos = createVector(mouseX, mouseY);
    }

    update() {
        this.pos.lerp(createVector(mouseX, mouseY), this.friction);
    }

    draw() {
        stroke(255);
        ellipse(this.pos.x, this.pos.y, this.radio, this.radio);
    }

}