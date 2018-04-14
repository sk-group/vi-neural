<template>
    <div>
        <hr/>
        <h1>Nice result</h1>
        <div class="mb">
            <button @click="learn">Learn</button>
        </div>
        <div v-if="configuration.inputs == 2">
            <canvas width="200" height="200" ref="canvas"></canvas>
        </div>
        <div v-else v-for="result in results">
            <table>
                <tr>
                    <td v-for="j in result.input.length" style="width: 10px">
                        {{ result.input[j - 1] }}
                    </td>
                    <td> => </td>
                    <td v-for="j in result.output.length" style="width: 500px">
                        {{ result.output[j - 1] }}
                    </td>
                </tr>
            </table>
        </div>
        <p>Iteration: {{ iteration }}</p>
        <h1>Test the network</h1>
        <div>
            <table>
                <td v-for="j in configuration.inputs">
                    <input v-model.number="testData[j - 1]" type="number"/>
                </td>
                <td> => </td>
                <td>{{ testResult }}</td>
            </table>
        </div>
        <button @click="test()">Test</button>
    </div>
</template>

<script>
    let synaptic = require('synaptic');

    export default {
        name: "Result",
        props: ['configuration', 'data', 'networkDesign'],
        data() {
            return {
                network: null,
                iteration: 0,
                testData: [],
                testResult: null,
                results: [],
            }
        },
        methods: {
            test() {
                this.testResult = this.network.activate(this.testData)
            },
            createNetwork() {
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
                this.createNetwork();

                let learningRate = 0.5;

                this.iteration = 0;
                let iterate = () => {
                    for (let i = 0; i < 10; i++) {
                        for (let data of this.data) {
                            this.network.activate(data.input);
                            this.network.propagate(learningRate, data.output);
                        }
                        this.iteration++;
                    }
                };
                if (this.configuration.inputs === 2) {
                    // run animation
                    let size = 200;
                    let res = 5;
                    let ctx = this.$refs.canvas.getContext("2d");
                    let draw = () => {
                        iterate();
                        ctx.clearRect(0, 0, size, size);
                        for (let x = 0; x <= size; x += res) {
                            for (let y = 0; y <= size; y += res) {
                                let alpha = this.network.activate([x / size, y / size]);
                                ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
                                ctx.fillRect(x, y, res, res);
                            }
                        }

                        if (this.iteration < this.configuration.iterations) {
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

                        if(this.iteration < this.configuration.iterations) {
                            requestAnimationFrame(showResults);
                        }
                    };
                    requestAnimationFrame(showResults);
                }
            },
        }
    }
</script>