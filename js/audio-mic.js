let mic;

function setup(){
    createCanvas(windowWidth,windowHeight);
    mic= new p5.AudioIn();
    mic.start();
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}

function draw(){
    background(0);

    let vol= mic.getLevel();
    let diameter= (vol * windowWidth) * 3;
    console.log(diameter);
    noFill();
    strokeWeight(vol * 50);
    stroke(vol * 255);
   
    let x = windowWidth / 2;
    let y = windowHeight /2;
    ellipse(x,y, diameter, diameter);
}