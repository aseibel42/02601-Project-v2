const SLOW = {
  newNeuron: 0.1,
  newSynapse: 0.1,
  randomWeight: 0.1,
  randomBias: 0.1,
  randomThreshold: 0.1
}

const MEDIUM = {
  newNeuron: 0.3,
  newSynapse: 0.3,
  randomWeight: 0.3,
  randomBias: 0.3,
  randomThreshold: 0.3
}

const FAST = {
  newNeuron: 0.5,
  newSynapse: 0.5,
  randomWeight: 0.5,
  randomBias: 0.5,
  randomThreshold: 0.5
}

class NeuronGene {

  constructor(t, b, layer, type) {
    this.id = 0;
    this.threshold = t;
    this.bias = b;
    this.layer = layer;
    this.type = type;
  }

  copy() { // When is this used????????
    return new NeuronGene(this.id);
  }
}

class SynapseGene {
  // constructor receives:
  // from: incoming NeuronGene object
  // to: outgoing NeuronGene object
  // ...
  constructor(from, to, w, enabled = true) {
    this.id = 0;
    this.from = from;
    this.to = to;
    this.weight = w;
    //this.length = to.layer - from.layer; // calculated attribute in get
    this.enabled = enabled;
  }

  get length() {
    return this.to.layer - this.from.layer;
  }
 
  copy() { // When is this used????????
    var copy = new SynapseGene(this.from, this.to, this.weight);
    copy.id = this.id; 
    return copy;
  }

  disable() {
    this.enabled = false;
  }
}



