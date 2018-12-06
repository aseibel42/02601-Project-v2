// vehicle.js
// This script contains object definitions

"use strict";

class Population {
  constructor() {
    this.vehicles = [];
  }

  update() {
    for (let v of this.vehicles) {
      v.update();
    }
  }

  render() {
    for (let v of this.vehicles) {
      v.render(); 
    }
  }

  addVehicle(v) {
    this.vehicles.push(v);
  }

  kill(v) {
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      if (v === this.vehicles[i]) {
        this.vehicles.splice(i, 1);
      }
    }
  }

  killAll() {
    this.vehicles = [];
  }

}

// Vehicle object constructor
// A vehicle is an abstraction of some generic creature
// Each vehicle is equipped with a set of sensors and effectors
// that are connected according to a neural circuit
class Vehicle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    // this.angle = random(0, 2*PI);
    this.angle = 0;
    this.angVelocity = 0;
    this.radius = 10;
    this.mass = this.radius * this.radius;
    this.moment = 10 * this.mass * this.radius * this.radius / 12;

    this.effectors = [];
    this.effectors.push(new Effector(this, "L"));
    this.effectors.push(new Effector(this, "R"))
    
    // pivot at midpoint between effectors (this will act as the axis of rotation)
    this.pivot = createVector(0, 0).add(this.effectors[0].position).add(this.effectors[1].position).mult(0.5);


    this.color = color(255, 255, 255); // white
    // this.maxSpeed = 3;
    
    // if genome arg provided:
    // this.network = new Network(genome)
    // else:
    // this.network
  }

  update() {

    // calculate new position and rotation
    this.position.add(this.velocity.mult(deltaT));
    this.pivot.add(this.velocity.mult(deltaT));
    this.angle -= this.angVelocity * deltaT;

    // console.log(this.position.x, this.position.y);


    // determin force and torque from effectors
    var F = 0;
    var T = 0;    
    for (let E of this.effectors) {
      F += E.activation * E.mag;
      T += E.activation * E.mag * E.hOffset;
    }

    // adjust force for friction
    if (this.velocity.magSq() < 0.00000001 && abs(F) < config.staticTranslationalFriction * this.mass) {
      F = 0;
    } else {
      F -= config.kineticTranslationalFriction * this.mass
    }

    // console.log(F);

    // adjust torque for angular friction
    if (abs(this.angVelocity) < 0.0001 && abs(T) < config.staticAngularFriction * this.moment) {
      T = 0;
    } else {
      // not sure if this is correct
      T -= (config.staticAngularFriction * this.moment + config.kineticAngularFriction * this.angVelocity);
    }

    // accelerate the vehicle
    this.velocity.add(createVector(0, 1).rotate(this.angle).mult(F*deltaT/this.mass));
    this.angVelocity += (T*deltaT/this.moment);

    // console.log(this.velocity.x, this.velocity.y);
  }

  // borders() {
  //   if (this.pos.x < -this.r)  this.pos.x = canvasWidth +this.r;
  //   if (this.pos.y < -this.r)  this.pos.y = canvasHeight+this.r;
  //   if (this.pos.x > canvasWidth +this.r) this.pos.x = -this.r;
  //   if (this.pos.y > canvasHeight+this.r) this.pos.y = -this.r;
  // }

  render() {

    // Body
    push();
    fill(this.color);
    stroke(0);
    translate(this.pivot);
    rotate(this.angle);
    rect(0, -1.35 * this.radius, this.radius, 1.5 * this.radius);  
    // Effectors
    for (let E of this.effectors) {
      E.render();
    }
    pop();

    

    // Sensors
    

    // Neural Circuit
    if (config.renderNeuralCircuit) {
      // this.Network.render()
    }

    
  }

}

class Effector {
  constructor(v, side) {
    this.parent = v; 
    this.vOffset = 1.35 * v.radius;
    if (side == "L" || side == "l" || side == "left" || side == "Left" || side == "LEFT") {
      this.hOffset = -1.3 * v.radius;
      this.activation = 2;
      this.position = createVector(1, 0).mult(this.hOffset).rotate(v.angle).add(createVector(0, 1).mult(this.vOffset).rotate(v.angle)).add(v.position);
    } else if (side == "R" || side == "r" || side == "right" || side == "Right" || side == "RIGHT") {
      this.hOffset = 1.3 * v.radius;
      this.activation = 0;
      this.position = createVector(1, 0).mult(this.hOffset).rotate(v.angle).add(createVector(0, 1).mult(this.vOffset).rotate(v.angle)).add(v.position);
    }
    // this.activation = 1;
    this.mag = 100;
  }

  render() {
    rect(this.hOffset, 0, 0.3 * this.parent.radius, 0.6 * this.parent.radius);
  }
}