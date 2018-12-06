// vehicle.js
// This script contains object definitions

"use strict";

class Population {
  constructor() {
    this.vehicles = [];
  }

  

}

// Vehicle object constructor
// A vehicle is an abstraction of some generic creature
// Each vehicle is equipped with a set of sensors and effectors
// that are connected according to a neural circuit
class Vehicle {
  constructor(x, y, r, theta, Env) {
    this.world = Env;

    // this.position = createVector(x, y);
    // this.angle = theta;
    this.body = new RigidBody(x, y, r, 1.5 * r, theta, 0, config.motorPlacement);
    this.radius = r;
    this.mass = this.radius * this.radius * 0.0005;
    this.moment = 10 * this.mass * this.radius * this.radius / 12;

    this.signal = new Signal(0, -1.35 * r, config.signalRadius, config.signalIntensity, SIGNAL_TYPE.HAZARD);
    if (this.world.signalTypes.indexOf(this.signal.type) == -1) {
      this.world.signalTypes.push(this.signal.type);
    }

    this.effectors = [];
    this.effectors.push(new Effector(this, "LEFT"));
    this.effectors.push(new Effector(this, "RIGHT"));

    this.sensors = [];
    var len = this.world.signalTypes.length;
    for (var i = 0; i < len; i++) {
      this.sensors.push(new Sensor(this, "LEFT", (PI/8 * (len-1)) * (-1*PI/4 + 2*i/len), this.world.signalTypes[i]));
      this.sensors.push(new Sensor(this, "RIGHT", -(PI/8 * (len-1)) * (-1*PI/4 + 2*i/len), this.world.signalTypes[i]));
    }
    
    // pivot at midpoint between effectors (this will act as the axis of rotation)
    this.pivot = p5.Vector.add(this.effectors[0].position).add(this.effectors[1].position).mult(0.5);

    // this.color = color(random(255), random(255), random(255));
    this.color = color(255, 255, 255); // white
    
    // if genome arg provided:
    // this.network = new Network(genome)
    // else:
    // this.network
  }

  update() {
    var d1, d2, dAvg, theta, r;

    // calculate distance traveled by each effector
    // d1 = this.effectors[0].drive(random(0, 1));
    // d2 = this.effectors[1].drive(random(0, 1));
    d1 = this.effectors[0].drive(1 - 2 * this.sensors[1].activation);
    d2 = this.effectors[1].drive(1 - 2 * this.sensors[0].activation);

    dAvg = (d1 + d2) / 2;
    theta = (d1 - d2) / (2.6 * this.radius);

    // update vehicle position
    if (theta != 0) {   // drive in an arc
      r = dAvg / theta;
      this.pivot.add(createVector(r * (1 - cos(theta)), -r * sin(theta)).rotate(this.angle));
      // this.body.position = this.pivot;
      // this.body.position = this.pivot.copy().add(createVector(0, -1.35 * r).rotate(this.angle));
      // this.body.position.add(createVector(0, 1.35 * r).rotate(this.angle).add(this.pivot));
      // this.signal.position = this.body.position;
      this.angle += theta;
    } else { // drive straight forward
      this.pivot.add(createVector(0, -dAvg).rotate(this.angle));
    }

    // update sensors
    for (let s of this.sensors) {
      s.sense();
    }
  }

  borders(type) {
    if (type == "Infinite") {
      if (this.pivot.x < -this.radius)  this.pivot.x = canvasWidth + this.radius;
      if (this.pivot.y < -this.radius)  this.pivot.y = canvasHeight + this.radius;
      if (this.pivot.x > canvasWidth + this.radius) this.pivot.x = -this.radius;
      if (this.pivot.y > canvasHeight + this.radius) this.pivot.y = -this.radius;
    } else if (type == "Walls") {
      
    }
    
  }

  render() {
    push();
    stroke(0);  // Black
    fill(this.color);

    // Body
    
    translate(this.body.pivot);
    rotate(this.body.angle);
    this.body.render();
    // rect(0, -1.35 * this.radius, this.radius, 1.5 * this.radius);

    // Sensors
    for (let s of this.sensors) {
      s.render();
    }

    // Effectors
    for (let e of this.effectors) {
      e.render();
    }

    // Signal
    this.signal.render();

    // Neural Circuit
    if (config.renderNeuralCircuit) {
      // this.Network.render()
    }

    pop();
  }
}

class Sensor {
  constructor(v, side, angle, type) {
    this.parent = v;
    this.type = type;
    this.angle = angle;
    this.vOffset = -1.5 * this.parent.radius;
    if (side == "LEFT" ) {
      this.hOffset = -this.parent.radius * 0.75;
      this.position = createVector(this.hOffset, this.vOffset);
    } else if (side == "RIGHT") {
      this.hOffset = this.parent.radius * 0.75;
      this.position = createVector(this.hOffset, this.vOffset);
    }
    if (this.type == SIGNAL_TYPE.LIGHT) {
      
    } else if (this.type == SIGNAL_TYPE.FOOD) {
      
    } else if (this.type == SIGNAL_TYPE.HAZARD) {
      
    }
    this.activation = 0;
  }

  sense() {
    var a = 0;
    var d;

    // Check all signals in the environment
    // var p = createVector(0, 0).add(this.position).add(this.parent.pivot);
    for (let s of this.parent.world.signals) {
      if (this.type == s.type && (d = p5.Vector.dist(createVector(0, -this.parent.radius * 1.25).add(this.position).rotate(this.parent.angle).add(this.parent.pivot), s.position)) < s.radius) {
        a += s.intensity * (1 - d/s.radius);
      }
    }

    // Now check signals of all vehicles in environment


    this.activation = a;
  }

  render() {
    var r = this.parent.radius;
    push();
    noFill();
    strokeWeight(r / 10);
    translate(createVector(0, -r * 1.25).add(this.position));
    rotate(this.angle);
    if (this.type == SIGNAL_TYPE.LIGHT) {
      stroke(230, 255, 0);
      line(0, 0, 0, -0.5 * r);
      arc(0, -0.75 * r, 0.5 * r, 0.5 * r, 0, PI);
    } else if (this.type == SIGNAL_TYPE.FOOD) {
      stroke(0, 255, 153);
      line(0, 0, 0, -0.5 * r);
      line(-0.25 * r, -0.5 * r, 0.25 * r, -0.5 * r);
      line(-0.25 * r, -0.5 * r, -0.25 * r, -0.75 * r);
      line(0.25 * r, -0.5 * r, 0.25 * r, -0.75 * r);
    } else if (this.type == SIGNAL_TYPE.HAZARD) {
      stroke(255, 0, 0);
      line(0, 0, 0, -0.5 * r);
      line(0, -0.5 * r, -0.25 * r, -0.75 * r);
      line(0, -0.5 * r, 0.25 * r, -0.75 * r);
    }
    pop();
  }

}

class Effector {
  constructor(v, side) {
    this.parent = v; 
    this.vOffset = 1.35 * v.radius;
    if (side == "LEFT" ) {
      this.hOffset = -1.3 * v.radius;
      this.position = createVector(this.hOffset, this.vOffset).rotate(v.angle).add(v.body.position);
    } else if (side == "RIGHT") {
      this.hOffset = 1.3 * v.radius;
      this.position = createVector(this.hOffset, this.vOffset).rotate(v.angle).add(v.body.position);
    }
    this.activation = 0;
    this.velocity = 0;
    this.mag = 100;
  }

  drive(a) {
    var distance;

    // calculate distance based on velocity
    distance = this.velocity * deltaT;

    // adjust for random noise
    distance *= (1 + random(config.environmentNoise));

    // update velocity, adjusting for friction
    this.activation = a;
    this.velocity += this.activation * this.mag * deltaT / this.parent.mass;
    this.velocity -= this.velocity * config.motorFriction;

    return distance;
  }

  render() {
    rect(this.hOffset, 0, 0.3 * this.parent.radius, 0.6 * this.parent.radius);
  }
}