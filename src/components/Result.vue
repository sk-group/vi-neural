<template>
    <div>
        <h1>Výsledek</h1>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label for="iterations">Maximální počet iterací</label>
                    <input v-model.number="configuration.iterations" id="iterations" type="number" class="form-control" step="100"/>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label for="speed">Rychlost animace (počet iterací ve snímku)</label>
                    <input v-model.number="configuration.speed" id="speed" type="number" class="form-control" step="10"/>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label for="learningRate">Míra učení</label>
                    <input id="learningRate" v-model.number="configuration.learningRate" min="0" step="0.1" type="number" class="form-control"/>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label for="activationFunction">Aktivační funkce</label>
                    <select v-model="configuration.activationFunction" id="activationFunction" class="form-control">
                        <option v-for="(func, key) in activationFunctions">{{ key }}</option>
                    </select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label for="minError">Minimální chyba</label>
                    <input id="minError" v-model.number="configuration.minError" min="0" max="1" step="0.001" class="form-control" type="number"/>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label for="activationFunction">Chybová funkce</label>
                    <select v-model="configuration.costFunction" id="costFunction" class="form-control">
                        <option v-for="(func, key) in costFunctions">{{ key }}</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="mb">
            <span class="btn btn-primary" @click="$emit('save')">Uložit síť s konfigurací</span>
        </div>
        <div class="mb">
            <button class="btn btn-primary" @click="learn">Učit</button>
            <button class="btn btn-danger" @click="stop = true">Stop</button>
        </div>
        <div v-if="normalizedInputs == 2 && normalizedOutputs == 1" class="canvas-container">
            <Axis :min="xMin" :max="xMax"/>
            <Axis vertical="true" :min="yMin" :max="yMax"/>
            <canvas width="500" height="500" ref="canvas"></canvas>
            <Axis bottom="true" :min="xMin" :max="xMax"/>
            <Axis vertical="true" bottom="true" :min="yMin" :max="yMax"/>
        </div>
        <div v-else v-for="result in results">
            <table class="result-table">
                <tr>
                    <td v-for="j in result.input.length">
                        <span v-if="typeof(result.input[j - 1]) === 'number'">
                            {{ result.input[j - 1].toFixed(5) }}
                        </span>
                        <span v-else>
                            {{ result.input[j - 1] }}
                        </span>

                    </td>
                    <td> => </td>
                    <td v-for="j in result.output.length">
                        <span v-if="typeof(result.output[j - 1]) === 'number'">
                            {{ result.output[j - 1].toFixed(5) }}
                        </span>
                        <span v-else>
                            {{ result.output[j - 1] }}
                        </span>
                    </td>
                </tr>
            </table>
        </div>
        <p>Iterace: {{ iteration }}</p>
        <p>Průměrná chyba: {{ error }}</p>
        <h1>Otestovat síť</h1>
        <div>
            <table class="mb">
                <td v-for="j in configuration.inputs">
                    <input v-model.number="testInput[j - 1]" class="form-control"/>
                </td>
            </table>
            <button @click="test" class="btn btn-primary mb">Test</button>
            <p>
                <span v-for="output in testOutput">
                    <span v-if="typeof(output) === 'number'">
                        {{ output.toFixed(5) }}
                    </span>
                    <span v-else>
                        {{ output }}
                </span>
            </span>
            </p>
        </div>
    </div>
</template>

<script>
    //  TODO: fix axes labels (toFixed())
    import Axis from './Axis.vue';
    import Normalizer from '../lib/Normalizer';

    let synaptic = require('synaptic');

    export default {
        name: "Result",
        props: ['configuration', 'data', 'networkDesign', 'metadata', 'normalizedInputs', 'normalizedOutputs'],
        components: {
            Axis
        },
        data() {
            return {
                network: null,
                iteration: 0,
                testInput: [],
                testOutput: null,
                results: [],
                stop: false,
                activationFunctions: synaptic.Neuron.squash,
                costFunctions: synaptic.Trainer.cost,
                error: 1
            }
        },
        computed: {
            xMin() {
                let xMin = 0;
                if(this.metadata && this.metadata.input[0]) {
                    let min = this.metadata.input[0].min;
                    return min < 1 ? xMin : min;
                }
                return xMin;
            },
            xMax() {
                let xMax = 1;
                if(this.metadata && this.metadata.input[0]) {
                    let max = this.metadata.input[0].max;
                    return max < 1 ? xMax : max;
                }
                return xMax;
            },
            yMin() {
                let yMin = 0;
                if(this.metadata && this.metadata.input[1]) {
                    let min = this.metadata.output[0].min;
                    return min < 1 ? yMin : min;
                }
                return yMin;
            },
            yMax() {
                let yMax = 1;
                if(this.metadata && this.metadata.input[1]) {
                    let max = this.metadata.output[0].max;
                    return max < 1 ? yMax : max;
                }
                return yMax;
            }
        },
        mounted() {
            let canvas = this.$refs.canvas;
            if (canvas) {
                let ctx = canvas.getContext("2d");
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        },
        methods: {
            test() {
                let normalizer = new Normalizer();
                normalizer.setMetadata(this.metadata);
                let normalizedInput = normalizer.normalizeInput(this.testInput);
                let output = this.network.activate(normalizedInput);
                this.testOutput = normalizer.deNormalizeOutput(output);
            },
            createNetwork() {
                let neurons = [];
                let inputLayer = new synaptic.Layer();
                let hiddenLayers = [];
                let outputLayer = new synaptic.Layer();
                for (let node of this.networkDesign.nodes) {
                    let neuron = new synaptic.Neuron();
                    neuron.nodeId = node.id;
                    neuron.squash = this.activationFunctions[this.configuration.activationFunction];
                    neurons.push(neuron);

                    if (node.id.startsWith('input')) {
                        inputLayer.list.push(neuron);
                    } else if (node.id.startsWith('output')) {
                        outputLayer.list.push(neuron);
                    }
                }

                let findNeighbors = (neuron) => {
                    let nodeIds = this.networkDesign.getNodeOuts(neuron.nodeId);
                    return neurons.filter((neuron) => {
                        return nodeIds.indexOf(neuron.nodeId) >= 0;
                    });
                };

                /*let projectNeurons = (source) => {
                    let neighbors = findNeighbors(neighbor);
                    for (let neighbor of neighbors) {
                        if (!source.connected(neighbor)) {
                            // connection doesn't exist yet
                            source.project(neighbor);
                            projectNeurons(neighbor)
                        }
                    }
                };*/

                let queue = [];
                let searchedNeuronsIds = [];

                // BFS
                for (let inputNeuron of inputLayer.list) {
                    //projectNeurons(inputNeuron); //DFS
                    queue.push(inputNeuron);
                    while (queue.length !== 0) {
                        let neuron = queue.shift();
                        let hiddenLayer = new synaptic.Layer();
                        let neighbors = findNeighbors(neuron);
                        for (let neighbor of neighbors) {
                            if (searchedNeuronsIds.indexOf(neighbor.nodeId) === -1 && !neighbor.nodeId.startsWith('output')) {
                                hiddenLayer.list.push(neighbor);
                                queue.push(neighbor);
                                searchedNeuronsIds.push(neighbor.nodeId);
                            }
                            neuron.project(neighbor);
                        }
                        if (hiddenLayer.list.length > 0) {
                            hiddenLayers.push(hiddenLayer)
                        }
                    }
                }
                this.network = new synaptic.Network({
                    input: inputLayer,
                    hidden: hiddenLayers,
                    output: outputLayer
                });
            },
            learn() {
                this.stop = false;
                this.error = 0;
                this.createNetwork();

                this.iteration = 0;
                let iterate = () => {
                    for (let i = 0; i < this.configuration.speed; i++) {
                        let errorSum = 0;
                        for (let data of this.data) {
                            let output = this.network.activate(data.input);
                            this.network.propagate(this.configuration.learningRate, data.output);
                            errorSum += this.costFunctions[this.configuration.costFunction](data.output, output);
                        }
                        this.iteration++;
                        this.error = errorSum / this.data.length;

                        if (this.iteration >= this.configuration.iterations || this.error <= this.configuration.minError) {
                            this.stop = true;
                            break;
                        }
                    }
                };
                if (this.normalizedInputs == 2 && this.normalizedOutputs == 1) {
                    // run animation
                    let canvas = this.$refs.canvas;
                    let res = 5;
                    let ctx = canvas.getContext("2d");
                    let draw = () => {
                        iterate();
                        ctx.fillStyle = "black";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        for (let x = 0; x <= canvas.width; x += res) {
                            for (let y = 0; y <= canvas.height; y += res) {
                                let alpha = this.network.activate([x / canvas.width, y / canvas.height]);
                                ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha[0] + ')';
                                ctx.fillRect(x, y, res, res);
                            }
                        }
                        let line = (x1, neuron) => {
                            let w = [];
                            for(let i in neuron.connections.inputs) {
                                if(!neuron.connections.inputs.hasOwnProperty(i)) {
                                    continue;
                                }
                                w.push(neuron.connections.inputs[i].weight);
                            }
                            return (neuron.bias - w[0] * x1) / w[1];
                        };
                        // draw lines
                        this.network.restore();
                        for(let neuron of this.network.layers.hidden[0].list) {
                            // TODO: fix line formula
                            ctx.strokeStyle = 'yellow';
                            ctx.beginPath();
                            let x1 = 0;
                            let y1 = line(0, neuron);
                            ctx.moveTo(x1, y1 * canvas.height);
                            let y2 = line(1, neuron);
                            ctx.lineTo(canvas.width, y2 * canvas.height);
                            ctx.stroke();
                        }
                        // TODO: draw data
                        if (!this.stop) {
                            requestAnimationFrame(draw);
                        }
                    };
                    requestAnimationFrame(draw);
                } else {
                    let showResults = () => {
                        iterate();
                        this.results = [];
                        for (let data of this.data) {
                            let input = data.input;
                            this.results.push({
                                input: input,
                                output: this.network.activate(input)
                            });
                        }
                        if (!this.stop) {
                            requestAnimationFrame(showResults);
                        }
                    };
                    requestAnimationFrame(showResults);
                }
            },
        }
    }
</script>

<style scoped lang="scss">
    .canvas-container {
        position: relative;
        margin: 0 auto;
        width: 540px;
        height: 540px;
        padding: 20px;

        canvas {
            transform: scaleY(-1);
        }
    }

    .result-table {
        td {
            width: 70px;
            text-align: center;
        }
    }
</style>