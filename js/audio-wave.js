let song, fft;
const samples = 16, smoothing = 0.7;

function preload(){
    song = loadSound("../audio/girlboss.mp3")
}

function setup(){
    let canvas = createCanvas(windowWidth,windowHeight);
    canvas.mousePressed(() => {
        if (song.isPlaying()) return song.pause();
       else return song.play();
    });
    fft = new p5.FFT(smoothing,samples);
    fft.setInput(song);
}


function draw(){
    background(0);
    stroke(256);
    noFill();
    strokeWeight(2);
    const spectrum = fft.analyze();
    const invertedSpectrum = spectrum.slice().reverse();
    const values = invertedSpectrum.concat(spectrum);
    beginShape();
    curveVertex(0,height/2);
    for(let i = 0; i < values.length; i++){
        const x = map(i, 0, values.length,0,width);
        let yOffset = map(values[i],0,255,0,height/4);
        if(i % 2 == 0) yOffset *= -1;
        curveVertex(x,yOffset + height / 2);
    }
curveVertex(width,height / 2);
endShape();

}


function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}
