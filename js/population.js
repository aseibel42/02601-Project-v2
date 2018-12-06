
class Population {

    constructor(size, agentSize, mutationRate, signalTypes, signal, color) {
        this.size = size;
        this.agentSize = agentSize;
        this.mutationRate = mutationRate;
        this.signalTypes = signalTypes;
        this.signal = signal;
        this.color = color;

        this.generations = 0;
        this.vehicles = [];
        this.idGenerator = 0;

        this.matingPool = [];
        // create gene pool
        this.genePool =  new GenePool(signalTypes);

        // create a population of specified size
        for (let i = 0; i < size; i++) {
            // Create a vehicle
            let v = new Vehicle(random(canvasWidth), random(canvasHeight), this.agentSize, random(0, 2*PI), this.color, this.signalTypes, this.genePool);
            v.setSignal(this.signal);
            // Initialize genes from genePool
            //v.genome.initializeGenes(this.genePool);
            this.addVehicle(v);
        }
    }

    // fitness computes the fitness score for each vehicle in this population.
    fitness() {
        for (let i = 0; i < this.size; i++) {
            this.vehicles[i].fitness();
        }
    }

    // selection fills the matingPool array for selection based on probability.
    selection() {
        this.matingPool = []; // matingPool will have length 100
        for (let i = 0; i < this.size; i++) {
            // add vehicles[i] to mating pool a number of times proportionate to its fitness score
            let nTimes = this.vehicles[i].fitness * 100;
            for (let j = 0; j < nTimes; j++) {
                this.matingPool.push(this.vehicles[i]);
            }
        }
        console.log(this.matingPool);
    }
    
    // style can be 0 for normal crossover, or 1 for biased crossover
    reproduction(style = 0) {
        this.vehicles = [];
        // generate size childs for next generation
        for (let i = 0; i < this.size; i++) {
            var parent1 = random(this.matingPool);
            var parent2 = null;
            do {
                parent2 = random(this.matingPool);
            } while(parent1 === parent2);
            
            var child = new Vehicle(random(canvasWidth), random(canvasHeight), this.agentSize, random(0, 2*PI), this.color, this.signalTypes, this.genePool);
            
            if (style === 0) {

                child = Vehicle.crossover(parent1, parent2, child);

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

    addVehicle(itm) {
        itm.id = ++this.idGenerator;
        this.vehicles.push(itm);
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

    testReproduction() {
        var parent1 = random(this.vehicles);
        var parent2 = random(this.vehicles);
        console.log(parent1, parent2);

        var child = new Vehicle(random(canvasWidth), random(canvasHeight), this.agentSize, random(0, 2*PI), this.color, this.signalTypes, this.genePool);
        child = Vehicle.crossover(parent1, parent2, child);
        console.log(child);
    }
}