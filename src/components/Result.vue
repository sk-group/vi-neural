<template>
    <div>
        <h1>Výsledek</h1>
        <span class="btn btn-primary" @click="$emit('save')">Uložit</span>
        <div class="mb">
            <button class="btn btn-primary" @click="learn">Learn</button>
            <button class="btn btn-danger" @click="stop = true">Stop</button>
        </div>
        <div v-if="normalizedInputs == 2 && normalizedOutputs == 1" class="canvas-container">
            <Axis />
            <Axis vertical="true"/>
            <canvas width="500" height="500" ref="canvas"></canvas>
            <Axis bottom="true" />
            <Axis vertical="true" bottom="true" />
        </div>
        <div v-else v-for="result in results">
            <table>
                <tr>
                    <td v-for="j in result.input.length" style="width: 10px">
                        {{ result.input[j - 1] }},
                    </td>
                    <td> => </td>
                    <td v-for="j in result.output.length" style="width: 150px">
                        {{ result.output[j - 1] }},
                    </td>
                </tr>
            </table>
        </div>
        <p>Iteration: {{ iteration }}</p>
        <h1>Test the network</h1>
        <div>
            <table>
                <td v-for="j in configuration.inputs">
                    <input v-model.number="testInput[j - 1]" />
                </td>
                <td> => </td>
                <td>{{ testOutput }}</td>
            </table>
        </div>
        <button @click="test">Test</button>
    </div>
</template>

<script>
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
                stop: false
            }
        },
        mounted() {
            let canvas = this.$refs.canvas;
            if(canvas) {
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
                // TODO: check when more layers
                let neurons = [];
                let inputLayer = new synaptic.Layer();
                let hiddenLayers = [];
                let outputLayer = new synaptic.Layer();
                for (let node of this.networkDesign.nodes) {
                    let neuron = new synaptic.Neuron();
                    neuron.nodeId = node.id;
                    neurons.push(neuron);

                    if (node.id.startsWith('input')) {
                        inputLayer.list.push(neuron);
                    } else if (node.id.startsWith('output')) {
                        outputLayer.list.push(neuron);
                    } else {
                        // hidden layer for each hidden neuron, so we can create synaptic.Network
                        let hiddenLayer = new synaptic.Layer();
                        hiddenLayer.list.push(neuron);
                        hiddenLayers.push(hiddenLayer);
                    }
                }

                //let existingConnections = [];

                let findNeighbors = (neuron) => {
                    let nodeIds = this.networkDesign.getNodeOuts(neuron.nodeId);
                    return neurons.filter((neuron) => {
                        return nodeIds.indexOf(neuron.nodeId) >= 0;
                    });
                };

                let projectNeurons = (source, neighbors) => {
                    for (let neighbor of neighbors) {
                        if (!source.connected(neighbor)) {
                            // connection doesn't exist yet
                            source.project(neighbor);
                            //existingConnections.push(source.nodeId + ' => ' + neighbor.nodeId);
                            projectNeurons(neighbor, findNeighbors(neighbor))
                        }
                    }
                };

                for (let inputNeuron of inputLayer.list) {
                    let neighbors = findNeighbors(inputNeuron);
                    projectNeurons(inputNeuron, neighbors);
                }

                this.network = new synaptic.Network({
                    input: inputLayer,
                    hidden: hiddenLayers,
                    output: outputLayer
                })
            },
            learn() {
                this.stop = false;
                this.createNetwork();

                this.iteration = 0;
                let iterate = () => {
                    for (let i = 0; i < this.configuration.speed; i++) {
                        for (let data of this.data) {
                            this.network.activate(data.input);
                            this.network.propagate(this.configuration.learningRate, data.output);
                        }
                        this.iteration++;
                    }
                };
                if (this.normalizedInputs == 2 && this.normalizedOutputs == 1) {
                    // run animation
                    let canvas = this.$refs.canvas;
                    let res = 5;
                    let ctx = canvas.getContext("2d");
                    let draw = () => {
                        iterate();
                        ctx.fillStyle= "black";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        for (let x = 0; x <= canvas.width; x += res) {
                            for (let y = 0; y <= canvas.height; y += res) {
                                let alpha = this.network.activate([x / canvas.width, y / canvas.height]);
                                ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
                                ctx.fillRect(x, y, res, res);
                            }
                        }

                        if (this.iteration >= this.configuration.iterations) {
                            this.stop = true;
                        }
                        if(!this.stop) {
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

                        if (this.iteration >= this.configuration.iterations) {
                            this.stop = true;
                        }
                        if(!this.stop) {
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
</style>