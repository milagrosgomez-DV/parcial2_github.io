// variables generales
let imgFiles = [
  "imagenes/imagenvertical2D1.jpg",
  "imagenes/imagenvertical2D2.jpg",
  "imagenes/imagenhorizontal2D1.jpg",
  "imagenes/imagenhorizontal2D2.jpg",
  "imagenes/imagenvertical3D1.jpg",
  "imagenes/imagenvertical3D2.jpg",
  "imagenes/imagenhorizontal3D1.jpg",
  "imagenes/imagenhorizontal3D2.jpg"
];

let items = [];
let itemSeleccionado = null;
let offsetX = 0;
let offsetY = 0;

// win y carrusel
let juegoGanado = false;
let tiempoVictoria = -1;
let galeriaOrganizada = false;
let DURACION_FLASH = 2000;
let DURACION_TEXTO = 4000;

// scroll para carrusel
let scrollX = 0;
let scrollXTarget = 0;
let scrollMin = 0;
let scrollMax = 0;
let lerpSpeed = 0.08;

let miCanvasElemento; // para la refe fisica del viewport

function preload() {
  for (let i = 0; i < imgFiles.length; i++) {
    items.push({
      img: loadImage(imgFiles[i]),
      x: 0,
      y: 0,
      w: 0, 
      h: 0, 
      tipo: i < 4 ? "2D" : "3D"
    });
  }
}

function setup() {
  let altoCanvas = windowWidth <= 1024 ? windowHeight * 0.55 : windowHeight * 0.70;
  let canvas = createCanvas(windowWidth, altoCanvas);
  canvas.parent('contenedor-juego');
  miCanvasElemento = canvas.elt; // html nativo
  
  items.sort(() => Math.random() - 0.5);
  posicionarMazoCartas();
}

function posicionarMazoCartas() {
  let altoImagenBase = 160;
  
  if (width < 765) {
    altoImagenBase = 110; 
  } else if (width >= 765 && width <= 1024) {
    altoImagenBase = 135; 
  }

  for (let i = 0; i < items.length; i++) {
    let aspecto = items[i].img.width / items[i].img.height;
    items[i].h = altoImagenBase;
    items[i].w = items[i].h * aspecto; 
    
    items[i].x = width / 2 - items[i].w / 2;
    items[i].y = height - items[i].h - 15; 
  }
}

function draw() {
  if (!juegoGanado) {
    dibujarModoJuego();
  } else {
    dibujarModoVictoria();
  }
}

function dibujarModoJuego() {
  background("#1A1A1A");
  
  noStroke();
  fill(255, 255, 255, 15);
  rect(0, 0, width / 2, height);
  fill(0, 122, 122, 20);
  rect(width / 2, 0, width / 2, height);
  
  stroke("#02FFF2");
  strokeWeight(2);
  line(width / 2, 0, width / 2, height);
  
  noStroke();
  fill(255, 255, 255, 130);
  let tamTexto = 32;
  if (width <= 1024) tamTexto = 22;
  if (width < 765) tamTexto = 18;
  
  textSize(tamTexto);
  textAlign(CENTER, TOP);
  text("SECTOR 2D", width / 4, 15);
  text("SECTOR 3D", (width * 3) / 4, 15);
  
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    let centroX = item.x + item.w / 2;
    
    let enSectorCorrecto = (item.tipo === "2D" && centroX < width / 2) || (item.tipo === "3D" && centroX >= width / 2);
    let estaEnElMazo = item !== itemSeleccionado && item.y >= height - item.h - 25 && centroX > width/2 - 120 && centroX < width/2 + 120;

    if (enSectorCorrecto && !estaEnElMazo) {
      stroke("#02FFF2");
      strokeWeight(3);
    } else {
      stroke("#007A7A");
      strokeWeight(1.5);
    }
    
    if (item.img && item.img.width > 0) {
      image(item.img, item.x, item.y, item.w, item.h);
      noFill();
      rect(item.x, item.y, item.w, item.h);
    }
  }
}

function dibujarModoVictoria() {
  if (!galeriaOrganizada) {
    organizarCarruselVictoria();
    galeriaOrganizada = true;
  }
  
  let elapsed = millis() - tiempoVictoria;
  background("#1A1A1A");
  
  let progresoTexto = constrain(elapsed / DURACION_TEXTO, 0, 1);
  let alphaTexto = lerp(255, 0, progresoTexto);
  if (alphaTexto > 0) {
    push();
    textAlign(CENTER, CENTER);
    textFont('Impact');
    noStroke();
    fill(0, 122, 122, alphaTexto);
    textSize(width <= 1024 ? height * 0.25 : height * 0.4);
    text("YOU", width / 2, height * 0.35);
    text("WON", width / 2, height * 0.65);
    pop();
  }
  
  scrollX = lerp(scrollX, scrollXTarget, lerpSpeed);
  
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    push();
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "rgba(2, 255, 242, 0.25)";
    if (item.img) {
      image(item.img, item.gx + scrollX, item.gy, item.gw, item.gh);
    }
    pop();
  }
  
  if (elapsed < DURACION_FLASH) {
    let progresoFlash = elapsed / DURACION_FLASH;
    let alphaFlash = lerp(255, 0, progresoFlash);
    noStroke();
    fill(255, 255, 255, alphaFlash);
    rect(0, 0, width, height);
  }
}

function organizarCarruselVictoria() {
  let alturaCarrusel = width <= 1024 ? height * 0.45 : height * 0.55;
  let centroY = height / 2;
  let separacion = width < 765 ? 20 : 35;
  let xActual = 50;
  
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    let escala = alturaCarrusel / item.img.height;
    item.gw = item.img.width * escala; 
    item.gh = alturaCarrusel;
    item.gx = xActual;
    item.gy = centroY - item.gh / 2;
    xActual += item.gw + separacion;
  }
  
  scrollMax = width / 2 - (items[0].gw / 2) - items[0].gx;
  let ultima = items[items.length - 1];
  scrollMin = width / 2 - (ultima.gw / 2) - ultima.gx;
  
  scrollX = scrollMax;
  scrollXTarget = scrollMax;
}

function verificarVictoria() {
  let todasCorrectas = true;
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    let centroX = item.x + item.w / 2;
    
    let estaEnElMazo = item.y >= height - item.h - 25 && centroX > width/2 - 120 && centroX < width/2 + 120;
    let correcta = (item.tipo === "2D" && centroX < width / 2) || (item.tipo === "3D" && centroX >= width / 2);
    
    if (estaEnElMazo || !correcta) {
      todasCorrectas = false;
      break;
    }
  }
  
  if (todasCorrectas) {
    juegoGanado = true;
    tiempoVictoria = millis();
  }
}

// scroll int para pc
function mouseWheel(event) {
  if (!juegoGanado) return true; 

  // cal del posicion del canvas al centro
  let datosCanvas = miCanvasElemento.getBoundingClientRect();
  let centroCanvasY = datosCanvas.top + datosCanvas.height / 2;
  let centroViewportY = windowHeight / 2;

  // Si el canvas NO está centrado deja la pag normal
  if (Math.abs(centroCanvasY - centroViewportY) > 80) {
    return true; 
  }
  
  // Si ya llegó al principio o al final de la galería, scroll general
  if (scrollXTarget >= scrollMax && event.delta < 0) return true;
  if (scrollXTarget <= scrollMin && event.delta > 0) return true;
  
  let velocidad = 1.2;
  scrollXTarget -= event.delta * velocidad;
  scrollXTarget = constrain(scrollXTarget, scrollMin, scrollMax);
  return false; 
}

function mousePressed() {
  if (juegoGanado) return;
  for (let i = items.length - 1; i >= 0; i--) {
    let item = items[i];
    if (mouseX > item.x && mouseX < item.x + item.w && mouseY > item.y && mouseY < item.y + item.h) {
      itemSeleccionado = item;
      offsetX = mouseX - item.x;
      offsetY = mouseY - item.y;
      items.splice(i, 1);
      items.push(itemSeleccionado); 
      break;
    }
  }
}

function mouseDragged() {
  if (itemSeleccionado && !juegoGanado) {
    itemSeleccionado.x = mouseX - offsetX;
    itemSeleccionado.y = mouseY - offsetY;
  }
}

function mouseReleased() {
  if (juegoGanado) return;
  itemSeleccionado = null;
  verificarVictoria();
}

// scroll tactil con limite
let touchXStart = 0;
let scrollXStart = 0;

function touchStarted() {
  if (touches.length > 0) {
    mouseX = touches[0].x;
    mouseY = touches[0].y;
    touchXStart = touches[0].x;
    scrollXStart = scrollXTarget;
    mousePressed();
  }
}

function touchMoved() {
  if (touches.length > 0) {
    mouseX = touches[0].x;
    mouseY = touches[0].y;
    
    if (juegoGanado) {
      let dx = touches[0].x - touchXStart;
      let siguienteScroll = scrollXStart + dx * 1.3;
      
      // Control estricto de límites 
      if (siguienteScroll >= scrollMax && dx > 0) return true;
      if (siguienteScroll <= scrollMin && dx < 0) return true;
      
      scrollXTarget = constrain(siguienteScroll, scrollMin, scrollMax);
      return false;
    } else {
      mouseDragged();
      if (itemSeleccionado) return false;
    }
  }
}

function touchEnded() {
  mouseReleased();
}

function windowResized() {
  let altoCanvas = windowWidth <= 1024 ? windowHeight * 0.55 : windowHeight * 0.70;
  resizeCanvas(windowWidth, altoCanvas);
  
  if (!juegoGanado) {
    posicionarMazoCartas();
  } else {
    galeriaOrganizada = false;
  }
}