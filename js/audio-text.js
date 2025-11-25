import SRTLector from './srt-reader.js'

let font, fontSize;
let song, fft, smoothing = 0.9, binSize = 128;
let amplitude = 0;
let audioSRTReader;
let currentsubtitle = "";
let center= {x:1, y:1}
let diameter = 100;
let vol = 0;
var t;

window.preload = () => {

    font = loadFont("../css/rubik.ttf");
    song = loadSound("../audio/crush.mp3")
    console.log(song);
    audioSRTReader = new SRTLector(song, '/subtitles.srt', {
        onSubtitleChange: (obj, currentTime) => {
            // Solo actualizar si el audio está reproduciéndose
            if (song.isPlaying() && obj) {
                currentsubtitle = String(obj.subtitle).toUpperCase()

            }
            
        }
    })
}

window.setup = () => {

    let canvas = createCanvas(windowWidth, windowHeight,WEBGL);

    diameter= max(width,height);

    textFont(font);
    textAlign(CENTER, CENTER);
    windowResized();
    amplitude = new p5.Amplitude();
    canvas.mousePressed(() => {
        if (song.isPlaying()) {
            song.pause();
        } else {
            
            song.play();
        }
    });

    fft = new p5.FFT(smoothing, binSize);
    fft.setInput(song);

}

window.windowResized = () => {

    fontSize = windowWidth / 11;
    resizeCanvas(windowWidth, windowHeight);
    textSize(fontSize);
    diameter= max(windowWidth,windowHeight);
   center= {x:width/2, y:height/2}
}

window.drawText = () =>{
    push();
    resetMatrix();
    translate(0, 0, 81);
    noStroke();
    fill(255 - int(vol * 255));
    textWrap(WORD);
    const textBoxWidth = width * 0.8;
    const textBoxHeight = height * 0.8;
    text(
        currentsubtitle,
        -center.x + (width * .1),
        -center.y + (height *.1),
        textBoxWidth,
        textBoxHeight
    );
    pop();
}

function drawsphere(diameter=10){
    push();
    translate(0, 0, -1);
    rotateY(vol * 0.2);
    noFill();
    stroke(255, 255, 0);
    sphere(diameter);            // esfera girando
    pop();

}

function drawlines(novertex=100){
    push();
    translate(0, 0, 0);
    beginShape();
    for (var i = 0; i < novertex; i++) {
      var ang = map(i, 10,novertex, 0, TWO_PI);
      var rad = (vol*(abs(sin(i)*200)+80))*(8) * noise(i * 0.03, frameCount * 0.006);
      var x = rad * cos(ang);
      var y = rad * sin(ang);
      curveVertex(x, y);
    }
    endShape();
    pop();

}

window.draw = () => {

    // let spectrum = fft.analyze();
   vol = amplitude.getLevel();
    // console.log(vol);

    background(int(vol * 255));

    drawText();
    
    stroke(255,0,0);
    noFill();
    stroke(0,0,255);
   
    
    drawsphere(90 * vol +10);

    drawlines(100);

}

