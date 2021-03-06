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
                    <input v-model.number="configuration.speed" id="speed" type="number" class="form-control" step="10" min="1"/>
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
            <span class="btn btn-primary" @click="$emit('save')">Uložit konfiguraci</span>
        </div>
        <div class="mb">
            <button class="btn btn-primary" @click="learn">Učit</button>
            <button class="btn btn-danger" @click="stop = true">Stop</button>
        </div>
        <div v-if="normalizedInputs == 2 && (normalizedOutputs == 1 || (configuration.outputs == 1 && metadata.output[0].type == 'string'))" class="canvas-container">
            <div class="checkboxes">
                <div class="form-check show-lines">
                    <input class="form-check-input" type="checkbox" v-model="showLines" id="showLines">
                    <label class="form-check-label" for="showLines">
                        Zobrazit přímky neuronů první skryté vrstvy
                    </label>
                </div>
                <div class="form-check show-data">
                    <input class="form-check-input" type="checkbox" v-model="showData" id="showData">
                    <label class="form-check-label" for="showData">
                        Zobrazit data
                    </label>
                </div>
            </div>
            <canvas width="1000" height="800" ref="canvas"></canvas>
            <div class="image-data-container">
                <Axis :min="normalizer.getXMin()" :max="normalizer.getXMax()" white="true"/>
                <Axis vertical="true" :min="normalizer.getYMin()" :max="normalizer.getYMax()" white="true"/>
                <div class="image-data" ref="imageData">
                    <div v-if="showData">
                        <span v-for="i in data.length" class="point"
                              :title="originalData[i - 1].input[0].toFixed(2) + ', ' + originalData[i - 1].input[1].toFixed(2) + ' => ' + originalData[i - 1].output"
                              :style="{
                                  left: data[i - 1].input[0] * 100 + '%',
                                  top: data[i - 1].input[1] * 100 +'%',
                                  backgroundColor: getColor(data[i - 1].output)
                              }"
                        />
                    </div>
                </div>
                <Axis bottom="true" :min="normalizer.getXMin()" :max="normalizer.getXMax()" white="true"/>
                <Axis vertical="true" bottom="true" :min="normalizer.getYMin()" :max="normalizer.getYMax()" white="true"/>
            </div>
        </div>
        <div v-else class="results-wrap">
            <div v-for="result in results">
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
        </div>
        <div v-if="this.network">
            <p>Iterace: {{ iteration }}</p>
            <p>Průměrná chyba: {{ error }}</p>
            <h1>Otestovat síť</h1>
            <div>
                <table class="mb">
                    <td v-for="j in configuration.inputs">
                        <label>{{ j }}. vstup</label>
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
    </div>
</template>

<script>
    /**
     * Show the network learning result
     */

    import Axis from './Axis.vue';
    import Normalizer from '../lib/Normalizer';
    import getColor from '../lib/ColorHelpers';

    let synaptic = require('synaptic');

    export default {
        name: "Result",
        props: ['configuration', 'data', 'originalData', 'networkDesign', 'metadata', 'normalizedInputs', 'normalizedOutputs'],
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
                error: 1,
                showData: true,
                showLines: true,
                inputConnectedNeurons: [],
                normalizer: new Normalizer(this.metadata),
                getColor: getColor
            }
        },
        watch: {
            /**
             * On show neuron lines checkbox change, reload the canvas
             */
            showLines() {
                this.drawOutput();
            }
        },
        mounted() {
            // fill canvas with black color
            let canvas = this.$refs.canvas;
            if (canvas) {
                let ctx = canvas.getContext("2d");
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        },
        methods: {
            /**
             * Test the network - take test inputs, normalize it, active the network and denormalize the output (using metadata)
             */
            test() {
                let normalizedInput = this.normalizer.normalizeInput(this.testInput);
                let output = this.network.activate(normalizedInput);
                this.testOutput = this.normalizer.deNormalizeOutput(output);
            },
            /**
             * Creates the Synaptic network from the graph data from NetworkDesign step
             */
            createNetwork() {
                let neurons = [];
                let inputLayer = new synaptic.Layer();
                let hiddenLayers = [];
                let outputLayer = new synaptic.Layer();
                // Create neurons
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

                /**
                 * Get neighbors of neuron (from graph)
                 */
                let findNeighbors = (neuron) => {
                    let nodeIds = this.networkDesign.getNodeOuts(neuron.nodeId);
                    return neurons.filter((neuron) => {
                        return nodeIds.indexOf(neuron.nodeId) >= 0;
                    });
                };

                let queue = [];
                let searchedNeuronsIds = [];
                this.inputConnectedNeurons = [];

                // perform BFS algorithm to create layers
                for (let inputNeuron of inputLayer.list) {
                    queue.push(inputNeuron);
                    while (queue.length !== 0) {
                        let neuron = queue.shift();
                        let hiddenLayer = new synaptic.Layer();
                        let neighbors = findNeighbors(neuron);
                        let isInputNeuron = inputLayer.list.indexOf(neuron) !== -1;
                        for (let neighbor of neighbors) {
                            if (searchedNeuronsIds.indexOf(neighbor.nodeId) === -1 && !neighbor.nodeId.startsWith('output')) {
                                if (isInputNeuron) {
                                    // neighbor is connected to input
                                    this.inputConnectedNeurons.push(neighbor);
                                }
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
                // create network
                this.network = new synaptic.Network({
                    input: inputLayer,
                    hidden: hiddenLayers,
                    output: outputLayer
                });
            },
            drawOutput() {
                if(this.network) {
                    let canvas = this.$refs.canvas;
                    let res = 5;
                    let ctx = canvas.getContext("2d");
                    let width = this.$refs.imageData.clientWidth;
                    let height = this.$refs.imageData.clientHeight;
                    let xOffset = (canvas.width - width) / 2;
                    let yOffset = (canvas.height - height) / 2;
                    let lineX1 = -width / canvas.width;
                    let lineX2 = 1 + width / canvas.width;
                    // draw network output
                    ctx.fillStyle = "black";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    for (let x = 0; x <= width; x += res) {
                        for (let y = 0; y <= height; y += res) {
                            let output = this.network.activate([x / width, y / height]);
                            ctx.fillStyle = this.getColor(output);
                            ctx.fillRect(x + xOffset, y + yOffset, res, res);
                        }
                    }
                    // draw lines
                    if (this.showLines) {
                        // line function
                        this.network.restore();
                        let line = (x1, neuron) => {
                            let w = [];
                            for (let i in neuron.connections.inputs) {
                                if (!neuron.connections.inputs.hasOwnProperty(i)) {
                                    continue;
                                }
                                w.push(neuron.connections.inputs[i].weight);
                            }
                            return -w[0] / w[1] * x1 - neuron.bias / w[1];
                        };
                        // draw lines of neurons in first hidden layer
                        for (let neuron of this.inputConnectedNeurons) {
                            ctx.strokeStyle = 'dodgerblue';
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            let lineY1 = line(lineX1, neuron);
                            ctx.moveTo(0, lineY1 * height + yOffset);
                            let lineY2 = line(lineX2, neuron);
                            ctx.lineTo(canvas.width, lineY2 * height + yOffset);
                            ctx.stroke();
                        }
                    }
                }
            },
            /**
             * Learn the network
             */
            learn() {
                this.stop = false;
                this.error = 0;
                // create the network first
                this.createNetwork();

                this.iteration = 0;
                /**
                 * Run iterations (according to the speed configuration)
                 */
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
                if (this.normalizedInputs == 2 && (this.normalizedOutputs == 1 || (this.configuration.outputs == 1 && this.metadata.output[0].type == 'string'))) {
                    /**
                     * Draw canvas animation
                     */
                    let draw = () => {
                        iterate();
                        this.drawOutput();
                        if (!this.stop) {
                            requestAnimationFrame(draw);
                        }
                    };
                    requestAnimationFrame(draw);
                } else {
                    /**
                     * Show result for each data row
                     */
                    let showResults = () => {
                        iterate();
                        this.results = [];
                        for (let i = 0; i < this.data.length; i++) {
                            let output = this.network.activate(this.data[i].input);
                            this.results.push({
                                input: this.originalData[i].input,
                                output: this.normalizer.deNormalizeOutput(output)
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

<style lang="scss">
    .canvas-container {
        position: relative;

        canvas {
            transform: scaleY(-1);
        }

        .checkboxes .form-check {
            position: absolute;
            bottom: calc(100% + 10px);
        }

        .show-data {
            right: 0;
        }

        .show-linex {
            left: 0;
        }

        .image-data-container {
            position: absolute;
            top: calc(50% - 277px);
            left: calc(50% - 268px);
            width: 540px;
            height: 540px;
            padding: 20px;
            z-index: 2;

            .image-data {
                transform: scaleY(-1);
                position: relative;
                width: 500px;
                height: 500px;

                .point {
                    width: 11px;
                    height: 11px;
                    border-radius: 50%;
                    border: 2px solid dodgerblue;
                    margin-left: -5.5px;
                    margin-top: -5.5px;
                    position: absolute;
                    background-color: black;
                }
            }
        }
    }

    .results-wrap {
        display: inline-block;
        margin: 0 auto;
        max-height: 400px;
        overflow: auto;
    }

    .result-table {
        td {
            text-align: left;
            width: 100px;
            white-space: nowrap;
        }
    }
</style>