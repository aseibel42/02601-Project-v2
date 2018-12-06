const NODETYPE = {
  INPUT: "INPUT",
  HIDDEN: "HIDDEN",
  OUTPUT: "OUTPUT"
};

var innovation = 0;

class Genome {
  constructor() {
    this.nodeGenes = [];  // input, output, or hidden
    this.connectionGenes = [];
    this.numLayers = 0;

    // input nodes: layer 0
    // output nodes: layer layers - 1
    // hidden nodes: between input and output layers

    // Physical genes
      // mass
      // speed
      // size?
      // color
      // signal
      // motor/sensor locations
  }

  addNodeGene(n) {
    this.nodeGenes.push(n);
  }

  addConnectionGene(c) {
    this.connectionGenes.push(c);
  }

  copy() {
    var g = new Genome();
    for (let n of this.nodeGenes) {
      g.addNodeGene(n.copy());
    }
    for (let c of this.connectionGenes) {
      g.addConnectionGene(c.copy());
    }

    return g;
  }

  newConnectionMutation() {
    // select 2 random nodes
    // add connection between nodes if one is not already there
    // if the connection would be going in the reverse direction, correct it
    // random weight

    var n1, n2;
    n1 = random(this.nodeGenes);
    n2 = random(this.nodeGenes);

    var exists = false;
    for (let c of connections) {
      if ((c.in == n1 && c.out == n2) || (c.out == n1 && c.in == n2)) {
        exists = true;
      }
    }

    // connections that have the same node for input and output are not allowed
    // also, connections that go from a node in a higher layer to a node in a lower layer are not allowed
    // also, do not make a new connection if one already exists
    var allowed = true;
    if (n1 == n2) {
      allowed = false
    } 
    
    if (allowed && !exists) {
      this.addConnectionGene(new ConnectionGene(n1, n2))
    }



  }

  newNodeMutation() {
    // an existing connection is split and the new node is placed where the old
    // connection used to be.
    // The old connection is disabled, and two new connections are added to the genome
    // New connection leading into the new node receives a weight of 1, and
    // new connection leading out from new node gets same weight as old connection

    var connection = random(this.connectionGenes);
    var n1, n2;
    n1 = connection.pre;
    n2 = connection.post;


  }

  // g1 is the more fit parent
  static Crossover(g1, g2) {

    // genes are either matching, disjoint, or excess
    // matching: same innovation number
    // disjoint: don't match, and inside range?
    // excess: don't match, and outside range?
    // node genes are taken from most fit parent

    var offspring = new Genome();
    
    for (let n of g1.nodeGenes) {
      offspring.addNodeGene(n.copy())
    }

    for (let c1 of g1.connectionGenes) {
      for (let c2 of g2.connectionGenes) {
        if (c1.innovation == c2.innovation) { // matching
          if (random() < 0.5) {
            offspring.addConnectionGene(c1.copy());
          } else {
            offspring.addConnectionGene(c2.copy());
          }
        } else {  // disjoint or excess
          offspring.addConnectionGene(c1.copy());
        }
      }
    }

    return offspring;
  }
}

class NodeGene {
  constructor(type, t, id, layer) {
    this.type = type;
    this.threshold = t;
    this.id = id;
    this.layer = layer;
  }

  copy() {
    return new NodeGene(this.type, this.i);
  }


}

class ConnectionGene {
  constructor(n1, n2, w, enabled, id) {
    this.in = n1;
    this.out = n2;
    this.weight = w;
    this.enabled = enabled;
    this.id = id;
  }

  copy() {
    return new ConnectionGene(this.in, this.out, this.weight, this.enabled, this.innovation);
  }

  disable() {
    this.enabled = false;
  }
}

// Neural circuit
// A neural circuit consists of all of a vehicle's sensors, effectors, and connections
class NeuralCircuit {
  constructor(parent, g) {
    this.parent = parent;
    this.synapses = [];    // container for connections of neural network
    this.layers = [];
    
    for (var i = 0; i < g.numLayers; i++) {
      this.layers[i] = new Array();
    }

    for (let n of g.nodeGenes) {
      this.addNeuron(new Neuron(this, n));
    }
    for (let c of g.connectionGenes) {
      this.addSynapse(new Synapse(this, c));
    }
  }

  addNeuron(n) {
    this.layers[n.layer].push(n)
  }

  addSynapse(s) {
    this.synapses.push(s);
  }

  getNeuron(id) {
    for (let l of this.layers) {
      for (let n of l) {
        console.log(n.id)
        if (n.id = id) {
          return n;
        }
      }
    }
  }

  process() {
    for (var i = 0; i < this.layers.length; i++) {
      for (let s of this.synapses) {
        if (s.pre.layer == i) {
          s.feedForward();
        }
      }
    }
  }

  render() {
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

// Neuron class definition
// A neuron has connections to other neurons via synapses
// Neuronal output depends on the input and activation function
class Neuron {
  constructor(network, g) {
    this.network = network;
    this.x = 0;
    this.y = 0;
    this.layer = g.layer;
    this.threshold = g.threshold;
    this.activation = 0;
  }

  adjustPosition(x, y) {
    this.x += x;
    this.y += y;
  }

  render(r) {
    push();
    fill(51);  // Dark gray
    ellipse(this.x, this.y, r/2, r/2);  // the radius should not be a constant
    pop();
  }
}

// Synapse class definition
// A synapse points to the postsynaptic neuron
// The weight ranges from -1 to 1, where a negative value is inhibitory, positive is excitatory
class Synapse {
  constructor(network, g) {
    this.network = network;
    this.pre = network.getNeuron(g.in.id);
    this.post = network.getNeuron(g.out.id);
    this.weight = g.weight;
    this.length = g.out.layer - g.in.layer;
    this.enabled = g.enabled;
    this.innovation = g.id;
  }
  
  // send output of presynaptic neuron to input of postsynaptic neuron
  feedForward() {
    var a, t;
    a = this.pre.activation;
    t = this.pre.threshold;
    if (a > t && this.enabled) {
      this.post.activation += (a * this.weight);
    }
  }

  render(r) {
    push();
    strokeWeight(r/10);
    console.log(this.pre.x);
    line(this.pre.x, this.pre.y, this.post.x, this.post.y);
    pop();
  }
  
}
