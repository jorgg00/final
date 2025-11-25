let color= 0;
let radius= 30;
let alpha= 30;

function setup() {
    createCanvas(windowWidth, windowHeight);
background(8,51,162);
}

function draw() {
   //background(22,75,190);
   //fill(255);
   //stroke(color);
   ellipse(mouseX, mouseY, radius, radius);
}

function mouseMoved() {
    console.log(mouseX,mouseY);
    fill(color,alpha)
   
}

function mousePressed() {
    console.log(mousePressed);
    stroke(255,255,0);
    fill(255,255,0);
    radius = 50;
   
}

function mouseReleased() {
    console.log(mouseReleased);
    stroke(color);
    fill(255);
    radius= 30;
}

function mouseDragged(){
    console.log(mouseDragged);
   stroke(8,51,162);
   fill(8,51,162);
}