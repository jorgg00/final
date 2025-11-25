const FRICTION= 0.1; //mientras más pegado a 1 más rápido, mientras más pegado a 0 más lento
let radio = 50;
const STROKE_WEIGHT= 10;
let fill_color= 0;
let red= 255;
let green= 55;
let blue= 45;
const BG_COLOR= "rgba(251, 251, 251, 0.5)"; //más cerca al 1, limpa más el fondo
const STROKE_COLOR= "rgba(114, 20, 20, 0.1)";
const MIN_RADIO= 30;
let pos= null;

function setup() {
    createCanvas(windowWidth, windowHeight);
    pos= createVector(mouseX, mouseY);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function update() {
    radio = abs(sin(frameCount * 0.01)) * 100 + MIN_RADIO;
    blue= abs(sin(frameCount * 0.01)) * 255;
    pos.lerp(createVector(mouseX, mouseY), FRICTION);
}

function draw() {
    update();
    background(BG_COLOR);
    ellipse(pos.x, pos.y, radio, radio);
    fill(red, green, blue);
    stroke(STROKE_COLOR);
    strokeWeight(STROKE_WEIGHT);
}   