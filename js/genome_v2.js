
class Genome {

    constructor() {
      this.inputNeuronGenes = [];
      this.outputNeuronGenes = [];
      this.neuronGenes = [];  // input, output, or hidden
      this.synapseGenes = [];
      this.numLayers = 2;  // input and output layer by default
    }
  
    // Born with default configuration
    initializeGenes(genePool) {
      for (let i = 0; i < genePool.synapseGenes.length; i++) {
        this.addSynapseGene(genePool.synapseGenes[i]);
        this.addNeuronGene(genePool.synapseGenes[i].from);
        this.addNeuronGene(genePool.synapseGenes[i].to);
      }
    }

    // crossover creates a new genome and evaluates if each of the edges from genome1 and genome2 is inherited.
    static crossover(genome1, genome2) {
        var newGenome = new Genome();
        //var allEdges = genome1.synapseGenes.concat(genome2.synapseGenes);
        var allEdges = genome1.combineSynapsesNoRepetition(genome2);
        // order edges from lower layers to higher
        allEdges.sort(orderSynapses);
        
        console.log(allEdges);

        for (let i = 0; i < allEdges.length; i++) {
            if (random(1) < 0.7) { // threshold for passing this trait
                if (allEdges[i].from.layer > 0) { // check if origin neuron exists, so we can add a new edge from it.
                    if (neuronExists(allEdges[i].from)) {
                        newGenome.addSynapseGene(allEdges[i]);
                        newGenome.addNeuronGene(allEdges[i].from);
                        newGenome.addNeuronGene(allEdges[i].to);
                    }
                } else {
                    newGenome.addSynapseGene(allEdges[i]);
                    newGenome.addNeuronGene(allEdges[i].from);
                    newGenome.addNeuronGene(allEdges[i].to);
                }
            }
        }

        return newGenome;
    }

    // crossoverBiased creates a new genome using common edges from parents.
    // It assumes genome1 as the fittest genome and gives it higher priority on inheritance.
    static crossoverBiased(genome1, genome2) {
        var newGenome = new Genome();
        //var allEdges = genome1.synapseGenes.concat(genome2.synapseGenes);
        var allEdges = genome1.combineSynapsesNoRepetition(genome2);
        // order edges from lower layers to higher
        allEdges.sort(orderSynapses);

        // inherit common edges
        for (let i = 0; i < allEdges.length; i++) {
            if (genome1.containsSynapseGene(allEdges[i]) && genome2.containsSynapseGene(allEdges[i])) { // if both genomes contain the synapse gene
                newGenome.addSynapseGene(allEdges[i]);
                newGenome.addNeuronGene(allEdges[i].from);
                newGenome.addNeuronGene(allEdges[i].to);
            } else if (genome1.containsSynapseGene(allEdges[i])) { // prioritize synapse genes from genome1
                if (random(1) < 0.7) { // threshold for passing this trait
                    newGenome.addSynapseGene(allEdges[i]);
                    newGenome.addNeuronGene(allEdges[i].from);
                    newGenome.addNeuronGene(allEdges[i].to);
                }
            }
        }

        return newGenome;
    }

    // mutate(mutationRate, genePool) {
    //     if (random(1) < mutationRate) {
    //         // select randomly two nodes from my neuron genes
    //         let allNeurons = this.getAllNeuronGenes();
    //         // n1 and n2 neuron genes belong to my genome
    //         let n1 = random(allNeurons);
    //         let n2 = random(allNeurons);
    //         genePool = this.mutateAddSynapse(n1, n2, genePool);
    //     }
    //     if (random(1) < mutationRate) {
    //         let s1 = random(this.synapseGenes);
    //         genePool = this.mutateAddNeuron(s1);
    //     }
    //     return genePool;
    // }

    mutate(newSynapseMutationRate, newNeuronMutationRate, genePool) {
        if (random() < newSynapseMutationRate) {
            // select randomly two nodes from my neuron genes
            let allNeurons = this.getAllNeuronGenes();
            // n1 and n2 neuron genes belong to my genome
            let n1 = random(allNeurons);
            let n2 = random(allNeurons);
            this.mutateAddSynapse(n1, n2, genePool);
        }
        if (random() < newNeuronMutationRate) {
            let s1 = random(this.synapseGenes);
            this.mutateAddNeuron(s1, genePool);
        }
    }

    mutateAddSynapse(n1, n2, genePool) {
        if (n1.layer == n2.layer) {
            return
        } else if (n1.layer > n2.layer) {
            let temp = n2;
            n2 = n1;
            n1 = temp;
        } else {
            // check if synapse gene already exists in gene pool
            var found = null;
            for (let i = 0; i < genePool.synapseGenes.length; i++) {
                if (genePool.synapseGenes[i].from.id === n1.id && genePool.synapseGenes[i].to.id === n2.id) {
                    found = genePool.synapseGenes[i];
                    break;
                }
            }
            // create (n1, n2) edge if it does not exist
            if (found === null) {
                let sg = new SynapseGene(n1, n2, random(-1, 1));
                // new mutations are added to gene pool first
                genePool.addSynapseGene(sg);
                this.addSynapseGene(sg);
            } else {
                // add synapse gene if it does not exit in my genome
                if (!this.containsSynapseGene(found)) {
                    this.addSynapseGene(found);
                }
            }

            console.log("successful add synapse mutation")
        }
        
    }

    // sg: synapse gene object
    mutateAddNeuron(sg, genePool) {
        var newLayerIndex = sg.from.layer + 1;
        // split edge
        var n1 = sg.from;
        var n2 = sg.to;
        // var weight = sg.weight;

        // if edge crosses 1 layer, add new layer in between
        if (sg.length === 1) {
            genePool.addLayer(newLayerIndex); // addLayer method updates the layer numbering for all nodes on layer > newLayerIndex
            this.numLayers++;
        }

        // remove sg from my synapseGenes
        this.removeSynapseGene(sg);
        // add new node in between n1 and n2
        // all neurons created at this point are of type hidden
        var ng = new NeuronGene(newLayerIndex, NODETYPE.HIDDEN);
        genePool.addNeuronGene(ng);
        this.addNeuronGene(ng);
        // create new edges
        var sg1 = new SynapseGene(n1, ng);
        var sg2 = new SynapseGene(ng, n2);
        genePool.addSynapseGene(sg1);
        genePool.addSynapseGene(sg2);
        this.addSynapseGene(sg1);
        this.addSynapseGene(sg2);

        console.log("successful add neuron mutation")
    }

    // mutateAddSynapse looks for the (n1,n2) edge in my genome and if it does not exist, it is created on genePool 
    // and added to my genome.
    // n1: NeuronGene object
    // n2: NeuronGene object
    // mutateAddSynapse(n1, n2, genePool) {
    //     // check if synapse gene already exists in gene pool
    //     var found = null;
    //     for (let i = 0; i < genePool.synapseGenes.length; i++) {
    //         if (genePool.synapseGenes[i].from.id === n1.id && genePool.synapseGenes[i].to.id === n2.id) {
    //             found = genePool.synapseGenes[i];
    //             break;
    //         }
    //     }
    //     // create (n1, n2) edge if it does not exist
    //     if (found === null) {
    //         let sg = new SynapseGene(n1, n2, random(-1, 1));
    //         // new mutations are added to gene pool first
    //         sg = genePool.addSynapseGene(sg);
    //         this.addSynapseGene(sg);
    //     } else {
    //         // add synapse gene if it does not exit in my genome
    //         if (!this.containsSynapseGene(found)) {
    //             this.addSynapseGene(found);
    //         }
    //     }

    //     return genePool;
    // }

    // // sg: synapse gene object
    // mutateAddNeuron(sg, genePool) {
    //     var newLayerIndex = sg.from.layer + 1;
    //     // split edge
    //     var n1 = sg.from;
    //     var n2 = sg.to;
    //     var weight = sg.weight;

    //     // if edge crosses 1 layer, add new layer in between
    //     if (sg.length === 1) {
    //         genePool.addLayer(newLayerIndex); // addLayer method updates the layer numbering for all nodes on layer > newLayerIndex
    //         // update layer numbering for n2
    //         n2.layer++;
    //         genePool.updateNeuronGene(n2);
    //         this.numLayers++;
    //     }

    //     // remove sg from my synapseGenes
    //     this.removeSynapseGene(sg);
    //     // add new node in between n1 and n2
    //     // all edges created at this point are of type hidden
    //     var ng = new NeuronGene(random(0, 1), random(-1, 1), newLayerIndex, NODETYPE.HIDDEN);
    //     ng = genePool.addNeuronGene(ng);
    //     this.addNeuronGene(ng);
    //     // create new edges
    //     var sg1 = new SynapseGene(n1, ng, random(-1, 1));
    //     var sg2 = new SynapseGene(ng, n2, weight);
    //     sg1 = genePool.addSynapseGene(sg1);
    //     sg2 = genePool.addSynapseGene(sg2);
    //     this.addSynapseGene(sg1);
    //     this.addSynapseGene(sg2);

    //     return genePool;
    // }

    // Assumes each single neuron is only present in one of the subsets (does not check for repeats).
    getAllNeuronGenes() {
        var allNeuronGenes = [];
        for (let itm of this.inputNeuronGenes) {
            allNeuronGenes.push(itm);
        }
        for (let itm of this.outputNeuronGenes) {
            allNeuronGenes.push(itm);
        }
        for (let itm of this.neuronGenes) {
            allNeuronGenes.push(itm);
        }
        return allNeuronGenes;
    }
    
    addNeuronGene(ng) {
        if (!this.containsNeuronGene(ng)) { // avoids duplicates
            if (ng.type == NODETYPE.INPUT) {
                this.inputNeuronGenes.push(ng);
            } else if (ng.type == NODETYPE.OUTPUT) {
                this.outputNeuronGenes.push(ng);
            } else {
                this.neuronGenes.push(ng);
            }
        }
    }
  
    addSynapseGene(sg) {
        if (!this.containsSynapseGene(sg)) { // avoids duplicates
            this.synapseGenes.push(sg);
        }
    }

    removeSynapseGene(sg) {
        for (let i = this.synapseGenes.length - 1; i >= 0; i--) {
            if (sg.id === this.synapseGenes[i].id) {
                this.synapseGenes.splice(i, 1);
            }
        }
    }

    containsSynapseGene(sg) {
        for (let i = 0; i < this.synapseGenes.length; i++) {
            if (sg.id === this.synapseGenes[i].id) {
                return true;
            }
        }
        return false;
    }

    containsNeuronGene(ng) {
        for (let i = 0; i < this.inputNeuronGenes.length; i++) {
            if (ng.id === this.inputNeuronGenes[i].id) {
                return true;
            }
        }
        for (let i = 0; i < this.outputNeuronGenes.length; i++) {
            if (ng.id === this.outputNeuronGenes[i].id) {
                return true;
            }
        }
        for (let i = 0; i < this.neuronGenes.length; i++) {
            if (ng.id === this.neuronGenes[i].id) {
                return true;
            }
        }
        return false;
    }

    checkIfNeuronExists(neuron) {
        var allNeurons = this.getAllNeuronGenes();
        for (let itm of allNeurons) {
            if (neuron.id === itm.id) {
                return true;
            }
        }
        return false;
    }

    combineSynapsesNoRepeat(genome) {
        var combined = [];
        combined = combined.concat(this.synapseGenes);

        for (let i = 0; i < genome.synapseGenes.length; i++) {
            let present = false;
            for (let j = 0; j < combined.length; j++) {
                if (genome.synapseGenes[i].id === combined[j].id) {
                    present = true;
                    break;
                }
            }
            if (!present) {
                combined.push(genome.synapseGenes[i]);
            }
        }
        return combined;
    }

    combineNeuronsNoRepeat(genome) {
        var combined = [];
        combined = combined.concat(this.getAllNeuronGenes());

        var gNeurons = genome.getAllNeuronGenes();
        for (let i = 0; i < gNeurons.length; i++) {
            if (!this.containsNeuronGene(gNeurons[i])) {
                combined.push(gNeurons[i]);
            }
        }
        return combined;
    }

    // orderSynapses comparison function for ordering
    orderSynapses(a, b) {
        if (a.from < b.from)
            return -1;
        if (a.from > b.from)
            return 1;
        return 0;
    }
  
    getNodeById(id) {
      for (let n of this.neuronGenes) {
        if (n.id == id) {
          return n;
        }
      }
      console.log("Error: unable to find node gene by ID.")
    }

    getSynapseById(id) {
        for (let s of this.synapseGenes) {
          if (s.id == id) {
            return s;
          }
        }
        console.log("Error: unable to find node gene at " + id.toString());
    }
  
    copy() { // when is this used??????????
      var g = new Genome();
      for (let n of this.neuronGenes) {
        g.addNeuronGene(n.copy());
      }
      for (let c of this.synapseGenes) {
        g.addSynapseGene(c.copy());
      }
  
      return g;
    }
  
  }