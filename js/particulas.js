import Particula from './particula.js'

let particulas = [];
window.setup = function(){
    createCanvas(windowWidth, windowHeight)
}
window.draw = function (){
    background(0,50);
    for(let particula of particulas){
    particula.update();
    particula.draw();
    }
    
}

window.mouseMoved = function(){
    const p = new Particula({
position: createVector(mouseX, mouseY),
life: random(150,200)
    });
    particulas.push(p); //agrega particula al array
    
}

window.windowResized = function(){
    resizeCanvas(windowWidth,windowHeight);
}
