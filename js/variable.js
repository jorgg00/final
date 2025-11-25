
const inputWght = document.getElementById('wght-slider');
const inputSlant = document.getElementById('slnt-slider');
const title = document.querySelector('h1');


function updateFontStyles(){
const wght = inputWght.value;
const slant = inputSlant.value;
title.style.fontWeight = wght;
title.style.fontVariationSettings = "'slnt' " +slant + ", 'ELSH' " + elsh
title.style.opacity = opacity;

}

inputWght.addEventListener('input', updateFontStyles);
inputSlant.addEventListener('input', updateFontStyles);
window.addEventListener('mousemove', function(event){
 console.log(event);
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    opacity = 1- (mouseX / window.innerWidth);
    elsh = (mouseY / window.innerHeight)*100;
  updateFontStyles();

    
});

