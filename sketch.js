const sketch1 = (p) => {

let trabajos = [];

// TAMAÑOS BASE
let cardW = 900;
let cardH = 1169;
let separacion = 720;
let suavizado = 0.08;
let escalaCentral = 1.25;

// VARIABLES
let posicionActual = 0;
let posicionObjetivo = 0;
let touchStartX = 0;
let touchStartY = 0;
let posicionInicialTouch = 0;

// preload
p.preload = function() {
  trabajos[0] = p.loadImage("./imagenes/imagen1.jpg");
  trabajos[1] = p.loadImage("./imagenes/imagen2.jpg");
  trabajos[2] = p.loadImage("./imagenes/imagen3.jpg");
  trabajos[3] = p.loadImage("./imagenes/imagen4.jpg");
  trabajos[4] = p.loadImage("./imagenes/imagen5.jpg");
  trabajos[5] = p.loadImage("./imagenes/imagen6.jpg");
  trabajos[6] = p.loadImage("./imagenes/imagen7.jpg");
  trabajos[7] = p.loadImage("./imagenes/imagen8.jpg");
  trabajos[8] = p.loadImage("./imagenes/imagen9.jpg");
  trabajos[9] = p.loadImage("./imagenes/imagen10.jpg");
  trabajos[10] = p.loadImage("./imagenes/imagen11.jpg");
  trabajos[11] = p.loadImage("./imagenes/imagen12.jpg");
}

// calcular tamaños responsive
function calcularTamanosResponsivos(anchoReferencia) {
  let escalaResponsiva;
  
  // dispositivos
  if (anchoReferencia < 600) {
    // mobil: 360px a 600px
    escalaResponsiva = p.map(anchoReferencia, 360, 600, 0.4, 0.65, true);
  } else if (anchoReferencia < 1025) {
    // tablet: 600px a 1024px
    escalaResponsiva = p.map(anchoReferencia, 600, 1025, 0.65,  0.5, true);
  } else {
    // pc: 1025px a 1920px+
    escalaResponsiva = p.map(anchoReferencia, 1025, 1920, 0.9, 1.5, true);
  }
  
  cardW = 900 * escalaResponsiva;
  cardH = 1169 * escalaResponsiva;
  separacion = 720 * escalaResponsiva;
  
  // Ajustar escala segun el ancho
  if (anchoReferencia < 600) {
    escalaCentral = 1.3;
  } else if (anchoReferencia < 1025) {
    escalaCentral = 1.1;
  } else {
    escalaCentral = 1.25;
  }
}

// setup
p.setup = function() {
  let contenedor = document.getElementById('contenedor-carrusel');
  let anchoContenedor = contenedor ? contenedor.offsetWidth : p.windowWidth;
  let altoContenedor = contenedor ? contenedor.offsetHeight : p.windowHeight * 0.6;

  // Si no tinee ancho valido, windowwidth
  if (anchoContenedor < 100 || anchoContenedor === undefined) {
    anchoContenedor = p.windowWidth;
  }

  // calcular alto segun ancho
  if (p.windowWidth < 480) {
    altoContenedor = anchoContenedor * 1.1;
  } else if (p.windowWidth < 1025) {
    altoContenedor = anchoContenedor * 1.0;
  } else {
    altoContenedor = p.windowHeight * 0.6;
  }

  let canvas = p.createCanvas(anchoContenedor, altoContenedor, p.WEBGL);
  canvas.parent('contenedor-carrusel');

  // responsive segun tamaño real
  calcularTamanosResponsivos(anchoContenedor);

  p.perspective(p.PI / 3, p.width / p.height, 0.1, 5000);
  p.noStroke();

  let gl = p.drawingContext;
  gl.enable(gl.POLYGON_OFFSET_FILL);
}

p.touchStarted = function() {
  if (p.touches.length > 0) {
    touchStartX = p.touches[0].x;
    touchStartY = p.touches[0].y;
    posicionInicialTouch = posicionObjetivo;
  }
};

p.touchMoved = function() {
  if (p.touches.length === 0) return;

  let dx = p.touches[0].x - touchStartX;
  let dy = p.touches[0].y - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    let delta = -dx / 120;
    posicionObjetivo = posicionInicialTouch + delta;
    posicionObjetivo = p.constrain(posicionObjetivo, 0, trabajos.length - 1);
    return false;
  }

  return true;
};

p.touchEnded = function() {
  posicionObjetivo = p.round(posicionObjetivo);
  posicionObjetivo = p.constrain(posicionObjetivo, 0, trabajos.length - 1);
};

// draw
p.draw = function() {
  p.background('#F9F9F7');

  posicionActual = p.lerp(posicionActual, posicionObjetivo, suavizado);

  let profundidadZ = (p.windowWidth < 1025) ? -150 : -1100;
  p.translate(0, 0, profundidadZ);

  for (let i = 0; i < trabajos.length; i++) {
    let offset = i - posicionActual;
    if (p.abs(offset) > 5) continue;

    p.push();
    let x = offset * separacion;
    let z = -p.abs(offset) * 340;
    let rotY = -offset * 0.28;
    let escala = p.map(p.abs(offset), 0, 5, escalaCentral, 0.65, true);

    p.translate(x, 0, z);
    p.rotateY(rotY);
    p.scale(escala);

    dibujarCard(trabajos[i]);
    p.pop();
  }
}

// cards
function dibujarCard(img) {

  p.push();
  let gl = p.drawingContext;
  gl.polygonOffset(-1.0, -1.0);
  p.texture(img);
  p.plane(cardW, cardH);
  gl.polygonOffset(0, 0);
  p.pop();
}

// scroll
p.mouseWheel = function(event) {

    if (
        p.mouseX < 0 || p.mouseX > p.width ||
        p.mouseY < 0 || p.mouseY > p.height
    ) {
        return true;
    }

    const enUltima =
        posicionObjetivo === trabajos.length - 1 &&
        Math.abs(posicionActual - (trabajos.length - 1)) < 0.03;

    const enPrimera =
        posicionObjetivo === 0 &&
        Math.abs(posicionActual) < 0.03;

    // scroll para abajo
    if (event.delta > 0) {

        if (!enUltima) {
            posicionObjetivo++;
            posicionObjetivo = p.constrain(posicionObjetivo, 0, trabajos.length - 1);
            return false;
        }

        // fin del scroll
        return true;
    }

    // Scroll para arriba
    else {

        if (!enPrimera) {
            posicionObjetivo--;
            posicionObjetivo = p.constrain(posicionObjetivo, 0, trabajos.length - 1);
            return false;
        }

        return true;
    }
};
// RESPONSIVE
p.windowResized = function() {
  let contenedor = document.getElementById('contenedor-carrusel');
  
  if (!contenedor) return;
  
  let anchoContenedor = contenedor.offsetWidth;
  let nuevoAlto;

  // usar windowWidth
  if (anchoContenedor < 100 || anchoContenedor === undefined) {
    anchoContenedor = p.windowWidth;
  }

  // alto basado en windowWidth
  if (p.windowWidth < 480) {
    nuevoAlto = anchoContenedor * 1.1;
  } else if (p.windowWidth < 1025) {
    nuevoAlto = anchoContenedor * 1.0;
  } else {
    nuevoAlto = p.windowHeight * 0.6;
  }

  //responsive
  calcularTamanosResponsivos(anchoContenedor);

  p.perspective(p.PI / 3, anchoContenedor / nuevoAlto, 0.1, 5000);
  p.resizeCanvas(anchoContenedor, nuevoAlto);
}

};

new p5(sketch1);