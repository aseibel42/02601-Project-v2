// vehicle.js

"use strict";


// Vehicle object constructor
// A vehicle is an abstraction of some generic creature.
// Each vehicle is equipped with a set of sensors and effectors that are connected according to a neural circuit.
// Each instance of Vehicle will have a size, color, signal, and neural circuit according to its genome
class Vehicle {
  constructor(x, y, population) {
    this.population = population
    this.id = 0;
    /* genetics */
    // create empty genome 
    this.genome = {};
    // born with default neural circuit
    // this.genome.initializeGenes(population.genePool);
    this.fitnessScore = 0;
    /************/
    
    // setup physical properties
    this.body = new Body(this, x, y, population.agentSize, 1.5*population.agentSize, random(0, 2*PI), 0, config.motorFrontBackPlacement);
    this.color = population.color;

    // setup sensors; create 2 for each sensor type.
    this.sensors = [];
    var len = population.sensorTypes.length;
    for (var i = 0; i < len; i++) {
      this.addSensor(new Sensor(this.body, "LEFT", (PI/6 * (len-1)) * (-1*PI/4 + 2*i/len), population.sensorTypes[i]))
      this.addSensor(new Sensor(this.body, "RIGHT", -(PI/6 * (len-1)) * (-1*PI/4 + 2*i/len), population.sensorTypes[i]))
    }
    
    // setup effectors
    this.effectors = [];
    this.addEffector(new Effector(this.body, "LEFT"));
    this.addEffector(new Effector(this.body, "RIGHT"));

    // setup signal
    this.addSignal(new Signal(0, this.body.axisOffsetY, config.signalRadius, config.signalIntensity, population.signal));    

    // setup Neural Circuit
    this.brain = new NeuralCircuit(this.body);
    // this.connectNeuralCircuit();    
  }

  // initialize() {

  //   this.genome = Genome.initializeGenome(this.population.genePool);
  //   //console.log(this.population.genePool)
  //   //console.log(this.genome)
  //   this.brain = new NeuralCircuit(this.body, this.genome);
  //   this.connectNeuralCircuit();
  //   this.body.addChild(this.brain);
  // }


  // Vehicle.addSensor takes as input a sensor object and adds it to Vehicle's 'sensors' array
  // Also adds the object as a child of the Vehicle's Body property for rendering purposes
  addSensor(s) {
    this.sensors.push(s);
    this.body.addChild(s);
  }

  // Vehicle.addEffector takes as input an effector object and adds it to Vehicle's 'effectors' array
  // Also adds the object as a child of the Vehicle's Body property for rendering purposes
  // *Note: a vehicle will always have exactly 2 effectors
  addEffector(e) {
    this.effectors.push(e);
    this.body.addChild(e);
  }

  // Vehicle.setSignal takes as input a Signal object and sets it as the Vehicle's signal property
  // Also adds the object as a child of the Vehicle's Body property for rendering purposes
  addSignal(s) {
    this.signal = s;
    this.body.addChild(s);
  }

  // Vehicle.connectNeuralCircuit is a utility function that adds Neurons to the Vehicle's Neural Circuit
  // for each of its effectors and sensors. It also adds synapses to the Neural Circuit according to the genome.
  connectNeuralCircuit() {

    // initialize layers of NC
    for (var i = 0; i < this.population.genePool.layers.length; i++) {
      this.brain.layers[i] = [];
    }

    // Add neurons to the neural network for each effector of the Vehicle, then connect effector/neuron with pointers
    for (var i = 0; i < this.effectors.length; i++) {
      var n = new EffectorNeuron(this.brain, this.genome.outputNeuronGenes[i], this.effectors[i]);
      this.brain.addNeuron(n);
      this.effectors[i].connect(n);
    }

    // Add neurons to the neural circuit for each sensor of the vehicle, then connect sensor/neuron with pointers
    // console.log(this.genome.inputNeuronGenes)
    for (var i = 0; i < this.sensors.length; i++) {
      var n = new SensorNeuron(this.brain, this.genome.inputNeuronGenes[i], this.sensors[i]);
      this.brain.addNeuron(n);
      this.sensors[i].connect(n);
    }

    // Add hidden layer neurons to the NC according to genome
    for (var i = 0; i < this.genome.neuronGenes.length; i++) {
      this.brain.addNeuron(new Neuron(this.brain, this.genome.neuronGenes[i]));
    }
    
    // add remaining connections according to genome
    for (let s of this.genome.synapseGenes) {
      this.brain.addSynapse(new Synapse(this.brain, s));
    }
    this.body.addChild(this.brain);
  }

  update() {
    // update position
    this.drive();

    // process inputs
    this.brain.process();

    // eat
    this.eat();
  }

  // Vehicle.drive updates the position of the vehicle based on the velocity of each effector
  drive() {
    var dL, dR, dAvg, theta, r;
    var EL, ER;
    EL = this.effectors[0]; ER = this.effectors[1];

    // calculate distance traveled by each effector
    dL = EL.velocity * deltaT;
    dR = ER.velocity * deltaT;

    // adjust for random noise
    dL *= (1 + random(config.environmentNoise));
    dR *= (1 + random(config.environmentNoise));

    // calculate distance traveled and steering angle
    dAvg = (dL + dR) / 2;
    theta = (dL - dR) / (abs(EL.x) + abs(ER.x));

    // move about pivot
    if (theta != 0) {   // drive in an arc
      r = dAvg / theta;
      this.body.pivot.add(createVector(r * (1 - cos(theta)), -r * sin(theta)).rotate(this.body.angle));
      this.body.angle += theta;
    } else { // drive straight forward
      this.body.pivot.add(createVector(0, -dAvg).rotate(this.body.angle));
    }

    // Update position
    this.body.position = p5.Vector.add(this.body.pivot, createVector(this.body.axisOffsetX, this.body.axisOffsetY).rotate(this.body.angle));    
    this.body.borders();

  }

  eat() {
    for (let s of world.signals) {
      let d = p5.Vector.dist(this.body.position, s.position);
      if (d < this.body.width) {
        s.consume(this);
      }
      
    }
  }

  // Vehicle.render displays the vehicle to the canvas using functions from the p5 library
  render() {
    push();
    stroke(0);  // Black
    fill(this.color);

    // Vehicle body
    this.body.render();

    pop();
  }


  /* genetics */

  // fitness function computes the fitness score for current object based on how well it achieved a certain goal.
  fitness() {
    // this.fitnessScore += random();
  }

  // crossover function creates a new genome from a combination of current object's genome and the partner's genome.
  static crossover(p1, p2) {

    let child = new Vehicle(random(canvasWidth), random(canvasHeight), p1. population);

    // create new genome
    let g = new Genome();

    let p2Genes = []; let p1Genes = [];
    for (let sg1 of p1.genome.synapseGenes) {
      for (let sg2 of p2.genome.synapseGenes) {
        if (sg1.id == sg2.id) {   // matching genes
          if (random() < 0.5) {
            g.addSynapseGene(sg2);
            g.addNeuronGene(sg2.from);
            g.addNeuronGene(sg2.to);
            p2Genes.push([sg2]);
          } else {
            g.addSynapseGene(sg1);
            g.addNeuronGene(sg1.from);
            g.addNeuronGene(sg1.to);
            p1Genes.push(sg1)
          }
        } else {  // incompatible genes
          g.addSynapseGene(sg1);
          g.addNeuronGene(sg1.from);
          g.addNeuronGene(sg1.to);
          p1Genes.push(sg1)
        }
      }
    }

    console.log(g);
    console.log(p1.population.genePool)

    // random structural mutations
    g.mutate(child.population.newSynapseMutationRate, child.population.newNeuronMutationRate, child.population.genePool)


    // construct new neural circuit structure
    child.genome = g;
    child.connectNeuralCircuit();

    // console.log(child.brain)
    // console.log(p1.brain)

    // inherit weights, biases, and thresholds
    for (let s of child.brain.synapses) {
      // console.log(s)
      console.log(1)
      let sg = p2.genome.getSynapseById(s.ID);
      // console.log(sg)
      // console.log(p2Genes.indexOf(sg))
      if (p2Genes.indexOf(sg) >= 0) { // inherited from p2
        let s2 = p2brain.getSynapseById(s.ID);
        s.weight = s2.weight;
        s.from.threshold = s2.from.threshold;
        s.from.bias = s.from.bias;
      } else if (p1Genes.indexOf(sg) >= 0) {  // inherited from p1
        let s2 = p1.brain.getSynapseById(s.ID);
        s.weight = s2.weight;
        s.pre.threshold = s2.pre.threshold;
        s.post.bias = s.post.bias;
      } else {
        s.weight = random(-1,1);
        s.pre.threshold = random();
        s.post.bias = random(-1, 1)
      }
    }

    // apply random mutations to non-structral properties of NC


    return child;
  }

  static crossoverBiased(parent1, parent2, child) {
    child.genome = Genome.crossoverBiased(parent1.genome, parent2.genome);
    return child;
  }

  // mutate function makes a random change in current's object genome based on mutationRate
  // It can change the genePool by generating new genes.
  mutate(mutationRate, genePool) {
    genePool = this.genome.mutate(mutationRate, genePool);
    return genePool;
  }
}

// Sensor class definition
// A sensor is responsible for detecting the signals in a Vehicle's environment.
// Each sensor has a specific type, and it can only detect signals of the same type.
class Sensor {
  constructor(parent, side, angle, type) {
    this.parent = parent;
    this.neuron = {};
    this.activation = 0;
    this.type = type;
    this.angle = angle;
    this.y = parent.axisOffsetY - parent.height * config.sensorFrontBackPlacement;
    if (side == "LEFT" ) {
      this.x = -this.parent.width * config.sensorSeparation;
    } else if (side == "RIGHT") {
      this.x = this.parent.width * config.sensorSeparation;
    }
  }

  // Sensor.sense checks the distance between the Sensor and every signal of the same type in the Environment.
  // If the distance is less than the signal radius, then the sensor detects the signal, and its activation increases as the distance
  // to the signal decreases.
  sense() {
    var a, d;
    // Check all signals in the environment and add sensor activation
    a = 0;
    for (let s of world.signals) {
      if (this.type == s.type) {
        d = p5.Vector.dist(createVector(this.x, this.y).rotate(this.parent.angle).add(this.parent.pivot), s.position);
        if (d < s.radius) {
          a += s.intensity * (1 - d/s.radius);
        }
      }      
    }
    // React to signals of all vehicles in all populations of environment
    for (let p of world.populations) {
      for (let v of p.vehicles) {
        // if this is not me
        if (this.parent != v.body && v.signal !== null) {
          if (this.type == v.signal.type) {
            d = p5.Vector.dist(createVector(this.x, this.y).rotate(this.parent.angle).add(this.parent.pivot), v.body.position);
            if (d < v.signal.radius) {
              a += v.signal.intensity * (1 - d/v.signal.radius);
            }
          }
        }
      }
    }

    /*
    if (v.signal != undefined) {
      for (let v of world.vehicles) {
        if (this.type == v.signal.type && this.parent != v.body) {
          d = p5.Vector.dist(createVector(this.x, this.y).rotate(this.parent.angle).add(this.parent.pivot), v.body.position);
          if (d < v.signal.radius) {
            a += v.signal.intensity * (1 - d/v.signal.radius);
          }
        }   
      }
    } */
    
    this.activation = a;
    this.neuron.activation = this.activation;
  }

  connect(n) {
    this.neuron = n;
  }

  // Sensor.render displays the sensor to the canvas using functions from the p5 library.
  render(r) {
    push();
    noFill();
    strokeWeight(r / 10);
    translate(this.x, this.y);
    rotate(this.angle);
    if (this.type == SIGNAL_TYPE.LIGHT) {
      stroke(255, 255, 0);
      line(0, 0, 0, -0.5 * r);
      arc(0, -0.75 * r, 0.4 * r, 0.5 * r, 0, PI);
    } else if (this.type == SIGNAL_TYPE.FOOD) {
      stroke(0, 255, 0);
      line(0, 0, 0, -0.5 * r);
      line(-0.2 * r, -0.5 * r, 0.2 * r, -0.5 * r);
      line(-0.2 * r, -0.5 * r, -0.2 * r, -0.75 * r);
      line(0.2 * r, -0.5 * r, 0.2 * r, -0.75 * r);
    } else if (this.type == SIGNAL_TYPE.HAZARD) {
      stroke(255, 0, 0);
      line(0, 0, 0, -0.5 * r);
      line(0, -0.5 * r, -0.2 * r, -0.75 * r);
      line(0, -0.5 * r, 0.2 * r, -0.75 * r);
    }
    pop();
  }

}

// Effector class definition
// An effector is responsible for the movement of a Vehicle. It is modeled as a motorized wheel, where an increase in the activation
// of the motor corresponds to a higher velocity.
class Effector {
  constructor(parent, side) {
    this.parent = parent;
    this.neuron = {};
    this.y = 0; 
    if (side == "LEFT" ) {
      this.x = -config.motorSeparation * parent.width;
    } else if (side == "RIGHT") {
      this.x = config.motorSeparation * parent.width;
    }
    this.activation = 0;
    this.velocity = 0;
    this.mag = 100;    
  }

  // Effector.update adjusts the Effector's velocity according to the activation of the associated neuron in the Vehilce's 
  // Neural Circuit. Velocity is also adjusted for friction.
  update() {
    this.activation = this.neuron.activation;
    this.activation = constrain(this.activation, -1, 1)
    this.velocity += this.activation * this.mag * deltaT / this.parent.mass;
    this.velocity -= this.velocity * config.motorFriction;
    }

  connect(n) {
    this.neuron = n;
  }

  // Effector.render displays the effector to the canvas using functions from p5 library
  render(r) {
    rect(this.x, this.y, 0.3*r, 0.6*r);
  }
}