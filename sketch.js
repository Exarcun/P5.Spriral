/* Configurazioni principali e variabili globali */
const HEX_SIZE = 30;
const HEX_WIDTH = HEX_SIZE * 2;
const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE;

let waveOffset = 0;
const WAVE_SPEED = 0.005;      
const WAVE_AMPLITUDE = 40;     
const WAVE_LENGTH = 400;       

let noiseOffset = 0; 
const NOISE_SPEED = 1;      
const NOISE_SCALE = 100;       
const NOISE_AMPLITUDE = 10;    

const SPARKLE_PROBABILITY = 0.00001;
let sparkles = [];
const SPARKLE_LIFETIME = 120;
const SPARKLE_RAYS = 6;
const SPARKLE_SIZES = [4, 8, 12];

const palettes = [
  ["#6D3023", "#C45B3B", "#FFB48F", "#FFDAB4", "#FFC09F"],
  ["#370617", "#6A040F", "#9D0208", "#DC2F02", "#E85D04"],
  ["#004B5E", "#2682A2", "#4ABCD9", "#98DCEB", "#C4FFF9"],
  ["#1B3A4B", "#285873", "#5B8E7D", "#9DD9D2", "#FEF9EF"]
];

let currentPaletteIndex = 0;
let nextPaletteIndex = 1;
let transitionProgress = 0;
const TRANSITION_SPEED = 0.005;
const PALETTE_HOLD_TIME = 10;
let holdCounter = 0;

let spiralAngle = 1;
const SPIRAL_SPEED = 0.1;        
const SPIRAL_TIGHTNESS = 0.03;   

/* hex a RGB */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/* Interpolazione */
function interpolateColors(color1, color2, factor) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  
  return color(r, g, b);
}

/* Restituisce il colore corrente in transizione tra due palette */
function getCurrentPaletteColor(index) {
  const currentPalette = palettes[currentPaletteIndex];
  const nextPalette = palettes[nextPaletteIndex];
  return interpolateColors(
    currentPalette[index],
    nextPalette[index],
    transitionProgress
  );
}

/* Imposta la tela e i parametri iniziali */
function setup() {
  createCanvas(1920, 1000);
  noStroke();
  rectMode(CORNER);
  nextPaletteIndex = (currentPaletteIndex + 1) % palettes.length;
}

/* Richiamata costantemente per ridisegnare la scena */
function draw() {
  if (holdCounter >= PALETTE_HOLD_TIME) {
    transitionProgress += TRANSITION_SPEED;
    if (transitionProgress >= 1) {
      currentPaletteIndex = nextPaletteIndex;
      nextPaletteIndex = (nextPaletteIndex + 1) % palettes.length;
      transitionProgress = 0;
      holdCounter = 0;
    }
  } else {
    holdCounter++;
  }
  
  drawBackgroundGradient(color(109, 48, 35), color(20, 10, 5));
  
  const cols = ceil(width / (HEX_WIDTH * 0.75)) + 1;
  const rows = ceil(height / HEX_HEIGHT) + 2;

  waveOffset += WAVE_SPEED;
  noiseOffset += NOISE_SPEED;
  spiralAngle += SPIRAL_SPEED;

  for (let row = rows; row >= 0; row--) {
    for (let col = 0; col < cols; col++) {
      const x = col * HEX_WIDTH * 0.75;
      const baseY = height - (row * HEX_HEIGHT + (col % 2) * HEX_HEIGHT / 2);

      const angleToCenter = atan2(baseY - height / 2, x - width / 2);
      const distanceFromCenter = dist(x, baseY, width / 2, height / 2);

      const spiralValue =
        angleToCenter + spiralAngle - distanceFromCenter * SPIRAL_TIGHTNESS;

      const waveY =
        sin(distanceFromCenter / WAVE_LENGTH - waveOffset) * WAVE_AMPLITUDE;
      const n = noise(
        (x + noiseOffset) / NOISE_SCALE,
        (baseY + noiseOffset) / NOISE_SCALE
      );
      const noiseY = map(n, 0, 1, -NOISE_AMPLITUDE, NOISE_AMPLITUDE);

      const finalY = baseY + waveY + noiseY;
      
      drawHexagon(x, finalY, spiralValue);
    }
  }
  
  drawSparkles();
}

/* Disegna esagono*/
function drawHexagon(x, y, spiralValue) {
  let colorIndex = floor(map(sin(spiralValue), -1, 1, 0, palettes[0].length - 0.001));
  let c = getCurrentPaletteColor(colorIndex);

  if (dist(mouseX, mouseY, x, y) < HEX_SIZE) {
    c = lerpColor(c, color(255, 255, 255), 0.2);
  }
  
  if (random(1) < SPARKLE_PROBABILITY) {
    sparkles.push({
      x,
      y,
      ttl: SPARKLE_LIFETIME,
      size: random(SPARKLE_SIZES),
      rotation: random(TWO_PI),
      hue: random(360),
    });
  }

  let rotationAmount = spiralValue * 0.2;

  push();
  translate(x, y);
  rotate(rotationAmount);
  fill(c);
  stroke(0, 80);
  strokeWeight(1.5);
  
  beginShape();
  for (let angle = 0; angle < TWO_PI; angle += TWO_PI / 6) {
    const hx = cos(angle) * HEX_SIZE;
    const hy = sin(angle) * HEX_SIZE;
    vertex(hx, hy);
  }
  endShape(CLOSE);
  pop();
}

/* stelle */
function drawSparkles() {
  push();
  blendMode(ADD);
  
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    const progress = s.ttl / SPARKLE_LIFETIME;
    const sparkleSize = s.size * (1 + sin(progress * PI) * 0.5);
    
    push();
    translate(s.x, s.y);
    rotate(s.rotation + frameCount * 0.02);
    
    for (let ray = 0; ray < SPARKLE_RAYS; ray++) {
      const rayAngle = (ray / SPARKLE_RAYS) * TWO_PI;
      const innerSize = sparkleSize * 0.3;
      const outerSize = sparkleSize * (1 + sin(frameCount * 0.1 + ray) * 0.2);
      
      for (let t = 0; t < 1; t += 0.1) {
        const size = lerp(innerSize, outerSize, t);
        const alpha = 255 * (1 - t) * progress;
        
        colorMode(HSL);
        fill(s.hue, 80, 70, alpha);
        
        const x = cos(rayAngle) * size;
        const y = sin(rayAngle) * size;
        ellipse(x, y, 2);
      }
    }
    
    colorMode(RGB);
    fill(255, 255, 200, 255 * progress);
    ellipse(0, 0, sparkleSize * 0.5);
    
    pop();
    
    s.ttl -= 1;
    if (s.ttl <= 0) {
      sparkles.splice(i, 1);
    }
  }
  
  pop();
}

/* gradient + sfondo */
function drawBackgroundGradient(c1, c2) {
  for (let i = 0; i < height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, i, width, i);
  }
}
