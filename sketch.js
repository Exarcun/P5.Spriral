import { HexagonField } from './components/hexagonField.js';
import { Sparkle } from './components/sparkle.js';
import { Background } from './components/background.js';
import { COLOR_PALETTES } from './config/constants.js';

let hexField;
let background;
let sparkles = [];

window.setup = function() {
  const p5 = window;
  createCanvas(1920, 1000);
  noStroke();
  rectMode(CORNER);

  hexField = new HexagonField(p5);
  background = new Background(p5);
}

window.draw = function() {
  const p5 = window;
  
  // Update
  hexField.update();
  sparkles = sparkles.filter(sparkle => sparkle.update());
  
  // Draw
  background.draw(color(109, 48, 35), color(20, 10, 5));
  hexField.draw();
  sparkles.forEach(sparkle => sparkle.draw());
}