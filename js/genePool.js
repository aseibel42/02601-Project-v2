
class GenePool {
    
    constructor(signalTypes) {
      this.synapseGenes = []; // edges determine the trait to be inherited
      this.layers = [[], []]; // array of array of neuronGenes. Initialized with two empty arrays.
      this.geneCount = 0;
      this.initializePool(signalTypes);
    }
  
    initializePool(signalTypes) {
      // create 2 input neurons for each type of signal (sensors)
      for (let i = 0; i < signalTypes.length * 2; i++) {
        let ng = new NeuronGene(random(0, 1), 0, 0, NODETYPE.INPUT);
        this.addNeuronGene(ng);    
      }
  
      // create 2 output neurons (effectors)
      let o1 = new NeuronGene(random(0, 1), random(-1, 1), 1, NODETYPE.OUTPUT);
      let o2 = new NeuronGene(random(0, 1), random(-1, 1), 1, NODETYPE.OUTPUT);
      this.addNeuronGene(o1);
      this.addNeuronGene(o2);
  
      // connect all inputs with all outputs
      for (let i = 0; i < this.layers[0].length; i++) {
        let s1 = new SynapseGene(this.layers[0][i], o1, random(-1, 1));
        let s2 = new SynapseGene(this.layers[0][i], o2, random(-1, 1));
        this.addSynapseGene(s1);
        this.addSynapseGene(s2);
      }
    }
  
    // NeuronGenes are stored in layers
    addNeuronGene(ng) {
      // autoincrement: unique id
      ng.id = ++this.geneCount;
      this.layers[ng.layer].push(ng);
      return ng;
    }
  
    addSynapseGene(sg) {
      // autoincrement: unique id
      sg.id = ++this.geneCount;
      this.synapseGenes.push(sg);
      return sg;
    }
  
    // addLayer function takes an index and inserts a new layer at index position of the layers array.
    addLayer(index) {
      this.layers.splice(index, 0, []);
      // update layer attribute of all NeuronGenes in any layer > index
      for (let i = index + 1; i < this.layers.length; i++) {
        for (let j = 0; j < this.layers[i].length; j++) {
          this.layers[i][j].layer++;
        }
      }
    }

    updateNeuronGene(ng) {
      // iterate over all neuron genes
      for (let i = 0; i < this.layers.length; i++) {
        for (let j = 0; j < this.layers[i].length; j++) {
          if (ng.id === this.layers[i][j].id) {
            this.layers[i][j].threshold = ng.threshold;
            this.layers[i][j].bias = ng.bias;
            this.layers[i][j].layer = ng.layer;
            this.layers[i][j].type = ng.type;
            ng = this.layers[i][j];
            break;
          }
        }
      }
      return ng;
    }
  
    exists(gene) { // for synapseGene
      
      return true;
    }
  }