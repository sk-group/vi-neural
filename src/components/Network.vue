<template>
    <div>
        <div class="mb">
            <label for="inputs">Input layer</label>
            <input v-model.number="config.inputs" id="inputs" type="number"/>
        </div>
        <div class="mb">
            <label for="hidden">Hidden layer</label>
            <input v-model.number="config.hidden" id="hidden" type="number"/>
        </div>
        <div class="mb">
            <label for="outputs">Output layer</label>
            <input v-model.number="config.outputs" id="outputs" type="number"/>
        </div>
        <div class="mb">
            <label for="iterations">Iterations</label>
            <input v-model.number="config.iterations" id="iterations" type="number"/>
        </div>
        <table class="mb">
            <tr v-for="i in data.length">
                <td v-for="j in config.inputs">
                    <input v-model.number="data[i - 1].input[j - 1]" type="number"/>
                </td>
                <td> => </td>
                <td v-for="j in config.outputs">
                    <input v-model.number="data[i - 1].output[j - 1]" type="number"/>
                </td>
                <td>
                    <button @click="removeData(i - 1)">-</button>
                </td>
            </tr>
        </table>
        <div class="mb">
            <button @click="addData()">+</button>
        </div>
        <div class="mb">
            <button @click="learn()">Learn</button>
        </div>
        <h1>Result</h1>
        <div v-if="config.inputs == 2">
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
                <td v-for="j in config.inputs">
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
    import Vue from 'vue';

    export default {
        data() {
            return {
                perceptron: null,
                iteration: 0,
                testData: [],
                testResult: null,
                config: {
                    inputs: 2,
                    hidden: 3,
                    outputs: 1,
                    iterations: 1000
                },
                data: [
                    {
                        input: [0, 0],
                        output: [0]
                    },
                    {
                        input: [1, 0],
                        output: [1]
                    },
                    {
                        input: [0, 1],
                        output: [1]
                    },
                    {
                        input: [1, 1],
                        output: [0]
                    },
                ],
                results: []
            }
        },
        methods: {
            addData() {
                this.data.push({
                    input: [],
                    output: []
                });
            },
            removeData(index) {
                this.data.splice(index, 1);
            },
            learn() {
                this.perceptron = new synaptic.Architect.Perceptron(this.config.inputs, this.config.hidden, this.config.outputs);
                let learningRate = 0.5;

                this.iteration = 0;
                let iterate = () =>
                {
                    for (let data of this.data) {
                        this.perceptron.activate(data.input);
                        this.perceptron.propagate(learningRate, data.output);
                    }
                    this.iteration++;
                };

                if(this.config.inputs === 2) {
                    // run animation
                    let size = 200;
                    let res = 5;
                    let ctx = this.$refs.canvas.getContext("2d");
                    let draw = () =>
                    {
                        iterate();
                        ctx.clearRect(0, 0, size, size);
                        for(let x = 0; x <= size; x += res) {
                            for(let y = 0; y <= size; y += res) {
                                let alpha = this.perceptron.activate([x/size, y/size]);
                                ctx.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
                                ctx.fillRect(x, y, res, res);
                            }
                        }

                        if(this.iteration < this.config.iterations) {
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
                                output: this.perceptron.activate(input)
                            });
                        }

                        if(this.iteration < this.config.iterations) {
                            requestAnimationFrame(showResults);
                        }
                    };
                    requestAnimationFrame(showResults);
                }
            },
            test() {
                this.testResult = this.perceptron.activate(this.testData)
            }
        }
    }
</script>