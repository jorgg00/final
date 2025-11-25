let mic,song,fft;
let smoothing = 0.9;
let samples = 128;
let columns = 16;
let rows = 8;

function preload() {
    song = loadSound("../audio/girlboss.mp3")
}
function setup(){
    let canvas = createCanvas(windowWidth,windowHeight);
    canvas.mousePressed(() => {
        if (song.isPlaying()) {
            song.pause();
        } else {
            song.play();
        }
    });
    
    // mic = new p5.AudioIn();
    // mic.start();
    fft = new p5.FFT(smoothing,samples);
    fft.setInput(mic);
    
}

function draw(){
    background(0);
    let spectrum = fft.analyze();
    let width_size = windowWidth / rows;
    let height_size = windowHeight / columns;
    let index = 0;
    for(let x = 0; x < windowWidth; x+= width_size){
        for(let y= 0; y < windowHeight; y += height_size){
            
            fill(spectrum[index],255-index, 255);
            text(spectrum[index],x,y);
            index++;
        }
    }
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}
