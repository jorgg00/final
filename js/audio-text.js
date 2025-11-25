import SRTLector from './srt-reader.js';

const DEFAULT_TRACK = new URL('../audio/crush.mp3', import.meta.url).href;
const DEFAULT_SUBTITLE = new URL('../audio/crush.srt', import.meta.url).href;
const BRIDGE_EVENT_ENDED = 'visualizer:track-ended';

let font;
let fontSize;
let song;
let fft;
const smoothing = 0.9;
const binSize = 128;
let amplitude = null;
let audioSRTReader = null;
let currentsubtitle = '';
let center = { x: 1, y: 1 };
let diameter = 100;
let vol = 0;
let currentTrackSrc = DEFAULT_TRACK;
let currentSubtitleSrc = DEFAULT_SUBTITLE;

const bridgeCommandQueue = [];
const audioVisualizerBridge = window.audioVisualizerBridge || {};
audioVisualizerBridge.ready = audioVisualizerBridge.ready || false;

const enqueueBridgeCommand = (type, payload = {}) =>
    new Promise((resolve, reject) => {
        const command = { type, payload, resolve, reject };
        if (audioVisualizerBridge.ready) {
            processBridgeCommand(command);
        } else {
            bridgeCommandQueue.push(command);
        }
    });

const processBridgeCommand = (command) => {
    Promise.resolve()
        .then(() => handleBridgeCommand(command))
        .then(command.resolve)
        .catch(command.reject);
};

audioVisualizerBridge.setTrack = (payload) => enqueueBridgeCommand('setTrack', payload);
audioVisualizerBridge.play = () => enqueueBridgeCommand('play');
audioVisualizerBridge.pause = () => enqueueBridgeCommand('pause');
window.audioVisualizerBridge = audioVisualizerBridge;

const normalizeTrackSrc = (src) => {
    const target = src || DEFAULT_TRACK;
    return new URL(target, window.location.href).href;
};

const normalizeSubtitleSrc = (src) => {
    const target = src || DEFAULT_SUBTITLE;
    return new URL(target, window.location.href).href;
};

const loadSoundAsync = (src) =>
    new Promise((resolve, reject) => {
        loadSound(
            src,
            (loaded) => resolve(loaded),
            (err) => reject(new Error(`No se pudo cargar el audio (${err?.message || 'desconocido'})`))
        );
    });

const dispatchVisualizerEvent = (name, detail = {}) => {
    window.dispatchEvent(new CustomEvent(name, { detail }));
};

const attachSubtitleReader = () => {
    if (!song) {
        return;
    }

    if (audioSRTReader) {
        audioSRTReader.destroy();
    }

    audioSRTReader = new SRTLector(song, currentSubtitleSrc, {
        onSubtitleChange: (obj) => {
            if (song && song.isPlaying() && obj) {
                currentsubtitle = String(obj.subtitle).toUpperCase();
            } else if (!obj) {
                currentsubtitle = '';
            }
        }
    });
};

const bindPlaybackEvents = () => {
    if (!song) {
        return;
    }

    song.onended(() => {
        dispatchVisualizerEvent(BRIDGE_EVENT_ENDED, { src: currentTrackSrc });
    });
};

const swapSong = (nextSong, nextSrc) => {
    if (song) {
        song.stop();
        song.disconnect();
    }

    song = nextSong;
    currentTrackSrc = nextSrc;

    if (fft) {
        fft.setInput(song);
    }
    if (amplitude) {
        amplitude.setInput(song);
    }

    bindPlaybackEvents();
    attachSubtitleReader();
    currentsubtitle = '';
};

const setTrackSource = async ({ src, subtitle } = {}) => {
    const normalizedSrc = normalizeTrackSrc(src);
    const normalizedSubtitle = normalizeSubtitleSrc(subtitle);
    const needsSwap = normalizedSrc !== currentTrackSrc || !song;

    currentSubtitleSrc = normalizedSubtitle;

    if (!needsSwap) {
        attachSubtitleReader();
        return song;
    }

    const nextSong = await loadSoundAsync(normalizedSrc);
    swapSong(nextSong, normalizedSrc);
    return song;
};

const handleBridgeCommand = async ({ type, payload }) => {
    switch (type) {
        case 'setTrack':
            await setTrackSource(payload);
            break;
        case 'play':
            if (!song) {
                throw new Error('No hay pista preparada');
            }
            song.play();
            break;
        case 'pause':
            if (song) {
                song.pause();
            }
            break;
        default:
            break;
    }
};

const flushBridgeQueue = () => {
    while (bridgeCommandQueue.length) {
        processBridgeCommand(bridgeCommandQueue.shift());
    }
};

window.preload = () => {
    font = loadFont('../css/rubik.ttf');
    song = loadSound(DEFAULT_TRACK);
};

window.setup = () => {
    createCanvas(windowWidth, windowHeight, WEBGL);

    diameter = max(width, height);

    textFont(font);
    textAlign(CENTER, CENTER);
    windowResized();
    amplitude = new p5.Amplitude();
    amplitude.setInput(song);

    fft = new p5.FFT(smoothing, binSize);
    fft.setInput(song);

    bindPlaybackEvents();
    attachSubtitleReader();

    audioVisualizerBridge.ready = true;
    flushBridgeQueue();
};

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

