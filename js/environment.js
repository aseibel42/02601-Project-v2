//
//

const SIGNAL_TYPE = {
  LIGHT: "LIGHT",
  FOOD: "FOOD",
  HAZARD: "HAZARD"
};

// Environment serves as a container for all non-vehicle elements that 
// the vehicles can interact with
class Environment {
  constructor() {
    this.walls = [];
    this.signalTypes = [];
    this.signals = [];
    this.vehicles = [];
  }

  update() {
    for (let v of this.vehicles) {
      v.update();
    }
  }

  addWall(w) {
    this.walls.push(w);
  }

  addSignal(s) {
    if (this.signalTypes.indexOf(s.type) == -1) {
      this.signalTypes.push(s.type);
    }
    this.signals.push(s);
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

  render() {
    for (let w of this.walls) {
      w.render();
    }
    for (let s of this.signals) {
      s.render();
    }
    for (let v of this.vehicles) {
      v.render();
    }
  }


}

// Box class definition
// Box objects are used for managing collisions
class Box {
  constructor(x, y, w, h, theta) {
    this.position = createVector(x, y);
    this.width = w;
    this.height = h;
    this.angle = theta;
    this.static = true;
  }

  // detectCollision takes a single argument that can either be an instance
  // of Box or an array of Box objects. For each Box in obj, check for
  // overlap; If the objects overlap, then respond to collision.
  detectCollision(obj) {
    if (obj instanceof Box) {
      
    }
    if (obj instanceof Array) {
      for (let b of obj) {

      }
    }
  }

  render() {
    push();
    translate(this.position);
    rotate(this.angle);
    rect(0, 0, this.width, this.height)
    pop();
  }
}

// Class definition for RigidBody, which inherits from Box
// This is the object used for vehicle bodies.
class RigidBody extends Box {
  constructor(x, y, w, h, theta, r, axisX, axisY) {
    super(x, y, w, h, theta); // call Box constructor
    this.radius = r;
    this.axisOffsetX = axisX * w;
    this.axisOffsetY = axisY * h;
    this.pivot = createVector(x + w * (axisX), y - h * (axisY));
    this.mass = 0.0005 * w * h * config.massScale;
    this.moment = this.mass * (w * w * (axisX * axisX - axisX + 1/3) + h * h * (axisY * axisY - axisY + 1/3));
    this.children = [];
    this.static = false;
    // this.velocity = 0;
    // this.angVelocity = 0;
  }

  addChild(c) {
    this.children.push(c);
  }

  move(dist, theta) {
    var r;
    
    // Move about pivot
    if (theta != 0) {   // drive in an arc
      r = dist / theta;
      this.pivot.add(createVector(r * (1 - cos(theta)), -r * sin(theta)).rotate(this.angle));
      this.angle += theta;
    } else { // drive straight forward
      this.pivot.add(createVector(0, -dist).rotate(this.angle));
    }

    // Update position
    this.position = p5.Vector.add(this.pivot, createVector(this.axisOffsetX, this.axisOffsetY).rotate(this.angle));  
    
    this.borders(config.borderType);
  }

  respondToCollision() {

  }

  borders(type) {
    if (type == "Infinite") {
      if (this.pivot.x < 0)  this.pivot.x = canvasWidth;
      if (this.pivot.y < 0)  this.pivot.y = canvasHeight;
      if (this.pivot.x > canvasWidth) this.pivot.x = 0;
      if (this.pivot.y > canvasHeight) this.pivot.y = 0;
    } else if (type == "Walls") {
      
    }
    
  }

  render() {
    push();
    translate(this.pivot);
    rotate(this.angle);
    rect(this.axisOffsetX, this.axisOffsetY, this.width, this.height)
    for (let c of this.children) {
      c.render(this.width);
    }
    pop();
  }  
}

class Signal {
  constructor(x, y, r, i, type) {
    this.position = createVector(x, y)
    this.radius = 100 * r;
    this.intensity = i;
    this.type = type;
  }

  render(r = 15) {

    push();
    if (this.type == SIGNAL_TYPE.LIGHT) {
      fill(230, 255, 0);
      ellipse(this.position.x, this.position.y, 1.5*r, 1.5*r);
      stroke(230, 255, 0);
    } else if (this.type == SIGNAL_TYPE.FOOD) {
      fill(0, 255, 153);
      rect(this.position.x, this.position.y, 0.45*r, 0.45*r);
      stroke(0, 255, 153);
    } else if (this.type == SIGNAL_TYPE.HAZARD) {
      fill(255, 0, 0);
      var x1, y1, x2, y2, x3, y3;
      x1 = this.position.x; y1 = this.position.y - 0.6*r;
      x2 = this.position.x - 0.6*r; y2 = this.position.y + 0.6*r;
      x3 = this.position.x + 0.6*r; y3 = this.position.y + 0.6*r;
      triangle(x1, y1, x2, y2, x3, y3);
      stroke(255, 0, 0);
    }
    if (config.renderFields) {
      noFill();
      ellipse(this.position.x, this.position.y, 2*this.radius, 2*this.radius);
    }
    pop();
  }

}

class Odor extends Signal {
  constructor(x, y, r, i, d) {
    super(x, y, r, i)
    this.duration = d;
  }

  // call diffuse every fame to reduce intensity over time
  diffuse() {

  }
}