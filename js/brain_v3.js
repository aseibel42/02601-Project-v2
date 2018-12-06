//

const NODETYPE = {
  INPUT: "INPUT",
  HIDDEN: "HIDDEN",
  OUTPUT: "OUTPUT"
};

//
class NeuralCircuit {
  constructor(parent) {
    this.parent = parent;   // vehicle body
    this.neurons = {};      // container for nodes of neural circuit
    this.layers = [];       
    this.synapses = [];    // container for connections of neural circuit

    // initialize layers of NC
    // for (var i = 0; i < genome.numLayers; i++) {
    //   this.layers[i] = [];
    // }

    // create neurons based on node genes
    // var s = 0;
    // for (let n of genome.nodeGenes) {
    //   if (n.type = NODETYPE.INPUT) {
    //     this.addNeuron(new SensorNeuron(this, n, this.parent.vehicle.sensors[s])); s++;
    //   } else if (n.type = NODETYPE.OUTPUT) {
    //     if (n.ID = 2) {
    //       this.addNeuron(new EffectorNeuron(this, n, this.parent.vehicle.effectors[0]));
    //     } else {
    //       this.addNeuron(new EffectorNeuron(this, n, this.parent.vehicle.effectors[0]));
    //     }
    //   } else {
    //     this.addNeuron(new Neuron(this, n));
    //   }
    // }

    // create synapses based on connection genes
    // for (let c of genome.connectionGenes) {
    //   this.addSynapse(new Synapse(this, c));
    // }
  }

  addNeuron(n) {
    console.log(n.layer)
    console.log(this.layers)
    this.layers[n.layer].push(n);
    this.neurons[n.ID] = n;
  }

  addSynapse(s) {
    this.synapses.push(s);
  }

  randomize() {
    for (let l of this.layers) {
      for (let n of l) {
        n.threshold = random(0, 1);
        n.bias = random(-1, 1);  
        n.activation = n.bias;     
      }
    }

    for (let s of this.synapses) {
      s.weight = random(-1, 1);
    }
  }

  getNeuronByID(id) {
    // for (let l of this.layers) {
    //   for (let n of l) {
    //     console.log(n.id)
    //     if (n.id = id) {
    //       return n;
    //     }
    //   }
    // }
    return this.neurons[id];
  }

  getSynapseById(id) {
    for (let s of this.synapses) {
      if (s.ID == id) {
        return s;
      }
    }
    console.log("Error: unable to find synapse at " + id.toString());
}

  // NeuralCircuit.process updates the activation levels of all neurons in the circuit by 
  // iterating through all the synapses in an order according to the layer of the presynaptic neuron 
  // of each sensor.
  process() {
    for (var i = 0; i < this.layers.length; i++) {
      //console.log(this.synapses[i]);
      for (let s of this.synapses) { 
        if (s.pre.layer == i && s.enabled) {

          // If the prysynaptic neuron is associated with a sensor, get the activation from the sensor
          if (s.pre instanceof(SensorNeuron)) {
            s.pre.sensor.sense();
          }

          // Send signal across synapse, from presynaptic neuron to postsynaptic neuron
          s.feedForward();

          // If the postsynaptic neuron is associated with an effector, update the effector activation
          if (s.post instanceof(EffectorNeuron)) {
            s.post.effector.update()
          }
        }
      }
      
      // Reset activations to zero each round
      for (let n of this.layers[i]) {
        n.activation = n.bias;
      }
    }
  }

  // NeuralCircuit.render displays the neural circuit to the canvas using functions from the p5 library
  render() {
    if (config.renderNeuralCircuit) {
      for (let l of this.layers) {
        for (let n of l) {
          n.render(this.parent.width);
        }
      }
      for (let c of this.synapses) {
        c.render(this.parent.width);
      }
    }    
  }
}

// Synapse class definition
// A synapse is essentially a directed edge on the Neural Circuit graph
class Synapse {
  constructor(network, gene) {
    this.network = network;
    this.ID = gene.id;
    this.pre = network.getNeuronByID(gene.from.id);
    this.post = network.getNeuronByID(gene.to.id);
    this.weight = gene.weight;
    this.length = gene.length;
    this.enabled = gene.enabled;
  }
  
  // Synapse.feedForward updates the activation of the postsynaptic neuron based on the 
  // activation level of the presynaptic level.
  feedForward() {
    var a, t;
    a = this.pre.activation;
    t = this.pre.threshold;
    if (a > t) {
      this.post.activation += (a * this.weight);
    }
  }

  // Synapse.render displays the synapse to the canvas as a line using functions from the p5 library
  render(r) {
    push();
    strokeWeight(r/10);
    line(this.pre.x, this.pre.y, this.post.x, this.post.y);
    pop();
  }
  
}

// Neuron class definition
// A neuron is essentially a node if the neural circuit is a graph
// Each neuron has a bias property that determines the baseline activation
class Neuron {
  constructor(network, gene) {
    this.network = network;
    this.ID = gene.id;
    this.layer = gene.layer;
    this.x = 0;
    this.y = 0;
    this.threshold = 0;
    this.bias = 0;
    this.activation = 0;
  }

  // Neuron.adjust position is used to update the rendering position of the neuron when 
  // adding more neurons causes changes in the layers of the Neural Circuit
  adjustPosition(x, y) {
    this.x += x;
    this.y += y;
  }

  // Neuron.render displays the neuron to the canvas using functions from the p5 library
  render(r) {
    push();
    fill(51);  // Dark gray
    ellipse(this.x, this.y, r/4, r/4);
    pop();
  }
}

// SensorNeuron class definition
// Inherits from the Neuron class and adds an additional property for the sensor that SensorNeuron
// is associated with. Sensor neurons have bias = 0.
class SensorNeuron extends Neuron {
  constructor(network, gene, sensor) {
    super(network, gene);
    this.bias = 0;
    this.sensor = sensor;
    this.x = sensor.x;
    this.y = sensor.y;
  }
}

// EffectorNeuron class definition
// Inherits from the Neuron class and adds an additional property for the effector that EffectorNeuron
// is associated with
class EffectorNeuron extends Neuron {
  constructor(network, gene, effector) {
    super(network, gene);
    this.effector = effector;
    this.x = effector.x;
    this.y = effector.y;
  }
}