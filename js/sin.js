let x = 0;
let amplitud= 100;

function setup(){
    createCanvas(windowWidth, windowHeight);
    stroke(255);
    line(0,height/2,width,height/2);
    fill(255);
    noStroke();
    background(0);
    
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}

function draw(){
let time = millis();
let y= Math.sin(time*.001)*amplitud;
const color= abs(sin(time*.001))*255;
const red= abs(sin(time*.01))*255;
const green= abs(sin(time*.01+1))*255;
const blue= abs(sin(time*.01+2))*255;
fill(red,green,blue);
ellipse(x,y+height/2,5,5);
if(x > width){
    x= 0;

}

x+=1;
}