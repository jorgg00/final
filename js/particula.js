export default class Particula{
    constructor(params={}) {
        this.pos = params.position || createVector(windowWidth,windowHeight);
        this.vel = createVector(0,0)
        this.size = 10;
        this.red = random(255);
        this.green = random(255);
        this.blue= random(255);
        this.color = color(255);
        this.alpha = 255;
        this.life = params.life || 100;
        this.setup();
    }
    //Procesos
    setup(){
const x = random(-5,5);
const y = random(-5,5);
this.vel = createVector(x,y);
    }

    update(){
        this.pos.add(this.vel);
        this.life--; // Decremento de vida de 1 unidad
        this.alpha = map(this.life,100,0,255,0);
        this.color = color(this.red,this.green,this.blue, this.alpha);
        this.size = map(this.life,100,0,70,0);
    }

//Salida
 draw() {
   //fill(this.color);
   noFill();
   stroke(this.color);
   ellipse(this.pos.x,this.pos.y,this.size,this.size);

    }
    
    isDead(){
        return this.life <=0;
    }
}