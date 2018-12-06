//
//

var config = {
  fps: 60,  // slider?

  simulationSpeed: 1, // slider

  renderNeuralCircuit: true,  
  renderFields: false, // turn on/off the circles around signals

  environmentNoise: 0.1,  // slider from 0 to 1
  signalRadius: 1,  // slider
  signalIntensity: 1, // slider

  massScale: 1, // (default = 0.1)
  motorFriction: 0.1, // slider from 0 to 1 (default = 0.1)
  motorFrontBackPlacement: -0.9,  // slides motors back / forward (ranges from -1 to 1) (default = -0.9)
  motorSeparation: 1.3, // slides motors closer together / farther apart (ranges from 0 to 1.5ish) (default = 1.3)
  sensorFrontBackPlacement: 0.9, // slides sensors back/ forward (ranges from 1 to -1) (default = 0.9)
  sensorSeparation: 0.75, // slides sensors closer together/ farther apart (ranges from 0 to 1) (default = 0.75)

  // populationSize: 10,
  generationLifespan: 10,
  numberCopied: 2
};

var simCanvas;
var canvasWidth, canvasHeight;
canvasWidth = 640; canvasHeight = 480;

var world = new Environment();

var deltaT = config.simulationSpeed/config.fps;

var generationTimer = 0;

function setup() {
  simCanvas = createCanvas(canvasWidth, canvasHeight);
  simCanvas.parent("simulation-canvas");

  frameRate(config.fps);
  rectMode(RADIUS);
  angleMode(RADIANS);

  // setup environment
  world.setup(ENV_SETTINGS1);

  var p1 = new Population(10, DEFAULT, SLOW);
  world.populations.push(p1);

  p1.populate();
}

function draw() {
  background(230);
  world.update();
  world.render();

  displayMouseCoordinates()
  displayFPS();
}

function mouseClicked() {

  world.populations[0].testReproduction();

}

function displayMouseCoordinates() {
  text("(" + mouseX.toString() + ", " + mouseY.toString() + ")", 0.005*canvasWidth, 0.965*canvasHeight, 100, 50);
}

function displayFPS() {
  text("fps: " + frameRate().toFixed(0), 0.005*canvasWidth, 0.005*canvasHeight, 100, 50);
}

function Module1() {

}
