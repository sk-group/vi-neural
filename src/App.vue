<template>
    <div id="app">
        <Progress :appFlow="appFlow"></Progress>
        <div class="container">
            <InputData
                    v-if="isVisible('inputData')"
                    :configuration="configuration"
                    :data="data"
            ></InputData>
            <NetworkDesign
                    v-if="isVisible('design')"
                    :configuration="configuration"
                    @start-learn="learn"
            ></NetworkDesign>
            <Result
                    v-if="isVisible('result')"
                    :configuration="configuration"
                    :perceptron="perceptron"
                    :testData="testData"
                    :iteration="iteration"
            ></Result>
        </div>
        <!--<Network />-->
    </div>
</template>

<script>
    import Network from './components/Network';
    import Progress from './components/Progress.vue';
    import InputData from './components/InputData.vue';
    import NetworkDesign from './components/NetworkDesign.vue';
    import Result from './components/Result.vue';
    let synaptic = require('synaptic');

    export default {
        name: 'App',
        components: {
            Network,
            Progress,
            InputData,
            NetworkDesign,
            Result
        },
        data(){
            return{
                perceptron: null,
                iteration: 0,
                testData: [],
                configuration: {
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
                results: [],
                appFlow: {
                    'inputData': {
                        active: true,
                        disabled: false,
                        name: 'Data'
                    },
                    'design': {
                        active: false,
                        disabled: true,
                        name: 'Návrh sítě'
                    },
                    'result': {
                        active: false,
                        disabled: true,
                        name: 'Výsledek'
                    }
                },
            }
        },
        methods:{
            show(sectionName = ''){
                for(let section in this.appFlow){
                    if (!this.appFlow.hasOwnProperty(section))
                        continue;
                    this.appFlow[section].active = false;
                    this.appFlow[section].disabled = true;
                }

                switch (sectionName){
                    case 'inputData':
                        this.appFlow.inputData.active = true;
                        this.setDisabledProgress();
                        break;
                    case 'design':
                        this.appFlow.design.active = true;
                        this.setDisabledProgress();
                        break;
                    case 'result':
                        this.appFlow.result.active = true;
                        this.setDisabledProgress();
                        break;
                    default:
                        break;
                }
            },
            setDisabledProgress() {
                for(let section in this.appFlow){
                    if (!this.appFlow.hasOwnProperty(section))
                        continue;
                    this.appFlow[section].disabled = false;
                }
            },
            isVisible(name){
                return this.appFlow[name].active || process.env.NODE_ENV === 'development';
            },
            learn() {
                this.perceptron = new synaptic.Architect.Perceptron(this.configuration.inputs, this.configuration.hidden, this.configuration.outputs);
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

                if(this.configuration.inputs === 2) {
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

                        if(this.iteration < this.configuration.iterations) {
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

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }

    table {
        margin: 0 auto;
        text-align: left;
    }

    .mb {
        margin-bottom: 5px;
    }
</style>
