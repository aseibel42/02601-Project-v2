
const DEFAULT = {
  size: 12,
  sensorTypes: [SIGNAL_TYPE.LIGHT],
  signal: SIGNAL_TYPE.LIGHT,
  color: [255, 255, 255]
}

const ALLSENSORS = {
  size: 15, 
  sensorTypes: [SIGNAL_TYPE.LIGHT, SIGNAL_TYPE.FOOD, SIGNAL_TYPE.HAZARD],
  signal: SIGNAL_TYPE.LIGHT,
  color: [130, 200, 255]
}

const PREY = {
    size: 8,
    sensorTypes: [SIGNAL_TYPE.HAZARD],
    signal: SIGNAL_TYPE.FOOD,
    color: [165, 165, 165]
}

const PREDATOR = {
    size: 16,
    sensorTypes: [SIGNAL_TYPE.FOOD],
    signal: SIGNAL_TYPE.HAZARD,
    color: [135, 135, 135]
}

class Population {

    constructor(size, traits, evolve) {
        this.size = size;
        this.agentSize = traits.size;
        this.sensorTypes = traits.sensorTypes;
        this.signal = traits.signal;
        this.color = color(traits.color);

        this.newNeuronMutationRate = evolve.newNeuron;
        this.newSynapseMutationRate = evolve.newSynapse;
        this.randomWeightMutationRate = evolve.randomWeight;
        this.randomBiasMutationRate = evolve.randomBias;
        this.randomThresholdMutationRate = evolve.randomThreshold;  

        this.vehicles = [];
        this.champions = [];
        this.generation = 0;
        this.idGenerator = 0;

        this.matingPool = [];
        this.genePool =  new GenePool(traits.sensorTypes);   
    }

    populate() {
        for (var i = 0; i < this.size; i++) {

            let g = new Genome();
            g.initializeGenes(this.genePool);

            let v = new Vehicle(random(canvasWidth), random(canvasHeight), this);
            v.genome = g;
            v.connectNeuralCircuit();
            v.brain.randomize();

            this.addVehicle(v);
        }
    }

    addVehicle(itm) {
      itm.id = ++this.idGenerator;
      this.vehicles.push(itm);
    }

    // fitness computes the fitness score for each vehicle in this population.
    fitness() {
        for (let i = 0; i < this.size; i++) {
            this.vehicles[i].fitness();
        }
    }

    sortByFitness() {
        this.vehicles.sort(CompareFitness);
    }

    // selection fills the matingPool array for selection based on probability.
    selection() {
        this.champions = [];
        this.matingPool = []; // matingPool will have length 100
        let total = 0;
        this.sortByFitness();
        for (let i = 0; i < this.size; i++) {
            total += this.vehicles[i].fitnessScore;
        }
        for (let i = 0; i < config.numberCopied; i++) {
            this.champions.push(this.vehicles[i]);
        }
        for (let i = 0; i < this.size; i++) {
            // add vehicles[i] to mating pool a number of times proportionate to its fitness score
            let nTimes = this.vehicles[i].fitnessScore/total * 100;
            for (let j = 0; j < nTimes; j++) {
                this.matingPool.push(this.vehicles[i]);
            }
        }
    }
    
    // style can be 0 for normal crossover, or 1 for biased crossover
    reproduction(style = 0) {
        this.vehicles = [];
        // generate size childs for next generation
        for (let i = 0; i < config.numberCopied; i++) {
            this.addVehicle(this.champions[i]);
        }
        for (let i = config.numberCopied; i < this.size; i++) {
            var parent1 = random(this.matingPool);
            var parent2 = null;
            do {
                parent2 = random(this.matingPool);
            } while(parent1 === parent2);
            
            var child;

            if (style === 0) {

                child = Vehicle.crossover(parent1, parent2);

            } else if (style === 1) {
                if (parent1.fitness > parent2.fitness) {
                    child = Vehicle.crossoverBiased(parent1, parent2, child);
                } else {
                    child = Vehicle.crossoverBiased(parent2, parent1, child);
                }
            }
            this.addVehicle(child);
        }
    }

    

    killOne(itm) {
        for (let i = this.vehicles.length - 1; i >= 0; i--) {
            if (this.vehicles[i] === itm) {
                this.vehicles.splice(i, 1);
            }
        }
    }

    killThemAll() {
        this.vehicles = [];
    }
    
    // update function is called on each frame and updates each object's properties.
    update() {
        this.fitness();
        generationTimer += deltaT;
        if (generationTimer > config.generationLifespan) {
            generationTimer = 0;
            this.selection();
            this.reproduction();
            this.generation++
        }
        for (let itm of this.vehicles) {
            itm.update();
        }
    }

    // render function is called on each frame and redraws the object on canvas.
    render() {
        for (let itm of this.vehicles) {
            itm.render();
        } 
    }

    // testReproduction() {
    //     var parent1 = random(this.vehicles);
    //     var parent2 = random(this.vehicles);
    //     console.log(parent1, parent2);

    //     var child = new Vehicle(random(canvasWidth), random(canvasHeight), this.agentSize, random(0, 2*PI), this.color, this.signalTypes, this.genePool);
    //     child = Vehicle.crossover(parent1, parent2, child);
    //     console.log(child);
    // }
}

function CompareFitness(a, b) {
    if (a.fitnessScore < b.fitnessScore) {
        return 1;
    } if (a.fitnessScore > b.fitnessScore) {
        return -1;
    } else {
        return 0;
    }
}