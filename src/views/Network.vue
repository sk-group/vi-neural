<template>
    <div id="network">
        <Progress :appFlow="appFlow"></Progress>
        <div class="container pb-5">
            <InputData
                    v-if="isVisible('inputData')"
                    :configuration="configuration"
                    :normalizedInputs="normalizedInputs"
                    :normalizedOutputs="normalizedOutputs"
                    :metadata="metadata"
                    :data="data"
                    @next="show('design')"
                    @load="loadFromFile"
                    @load-dummy="loadConfig"
                    @load-csv="loadFromFileCsv"
                    ref="inputData"
            ></InputData>
            <NetworkDesign
                    v-if="isVisible('design')"
                    :inputs="normalizedInputs"
                    :outputs="normalizedOutputs"
                    :configuration="configuration"
                    :dataGlobal="graphRaw"
                    @graph-change="networkDesignChange"
                    @next="show('result')"
            ></NetworkDesign>
            <Result
                    v-if="isVisible('result')"
                    :configuration="configuration"
                    :data="normalizedData"
                    :originalData="data"
                    :normalizedInputs="normalizedInputs"
                    :normalizedOutputs="normalizedOutputs"
                    :metadata="metadata"
                    :networkDesign="networkDesign"
                    @save="saveFile"
            ></Result>
        </div>
    </div>
</template>

<script>
    /**
     * Parent of all three sections (steps), contains variable which should be visible in all sections and changes the current section of this application
     */

    import Progress from '../components/Progress.vue';
    import InputData from '../components/InputData.vue';
    import NetworkDesign from '../components/NetworkDesign.vue';
    import NetworkDesignClass from '../lib/NetworkDesign';
    import Result from '../components/Result.vue';
    import Normalizer from '../lib/Normalizer';

    let FileSaver = require('file-saver');

    export default {
        name: 'App',
        components: {
            Progress,
            InputData,
            NetworkDesign,
            Result
        },
        created() {
            this.normalizeData();
        },
        watch: {
            data: {
                /**
                 * When user changes the data in input, normalize them
                 */
                handler() {
                    this.normalizeData();
                },
                deep: true
            }
        },
        computed: {
            /**
             * Returns number of inputs after data normalization
             */
            normalizedInputs() {
                let normalizedInputs = this.normalizer.getInputCount();
                if (normalizedInputs === 0) {
                    return this.configuration.inputs;
                }
                return normalizedInputs;
            },
            /**
             * Returns number of outputs after data normalization
             */
            normalizedOutputs() {
                let normalizedOutputs = this.normalizer.getOutputCount();
                if (normalizedOutputs === 0) {
                    return this.configuration.outputs;
                }
                return this.normalizer.getOutputCount();
            },
            /**
             * Returns normalized data
             */
            normalizedData() {
                return this.normalizer.getNormalizedData();
            },
            /**
             * Returns metadata of normalized data, so we can then denormalize them
             */
            metadata() {
                return this.normalizer.getMetadata();
            }
        },
        data() {
            return {
                /**
                 * Designed neural network
                 */
                graphRaw: {
                    nodes: [],
                    edges: []
                },
                configuration: {
                    inputs: 2,
                    hiddenLayers: [
                        {
                            count: 3
                        }
                    ],
                    hopfield: false,
                    outputs: 1,
                    iterations: 1000,
                    speed: 10,
                    learningRate: 0.5,
                    activationFunction: 'LOGISTIC',
                    costFunction: 'MSE',
                    minError: 0.005
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
                networkDesign: null,
                normalizer: new Normalizer()
            }
        },
        methods: {
            /**
             * Changes sections
             */
            show(sectionName = '') {
                for (let section in this.appFlow) {
                    if (!this.appFlow.hasOwnProperty(section))
                        continue;
                    this.appFlow[section].active = false;
                    this.appFlow[section].disabled = true;
                }

                switch (sectionName) {
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
            /**
             * Disable on of the sections
             */
            setDisabledProgress() {
                let findActive = false;
                for (let section in this.appFlow) {
                    if (!this.appFlow.hasOwnProperty(section))
                        continue;

                    if (!findActive) {
                        this.appFlow[section].disabled = false;
                    }

                    if (this.appFlow[section].active) {
                        findActive = true;
                    }
                }
            },
            /**
             * True, if section is visible, or environment is set to development (so we can see all sections at once)
             */
            isVisible(name) {
                return this.appFlow[name].active || process.env.NODE_ENV === 'development';
            },
            /**
             * Event to be called on network design change - creates the graph
             */
            networkDesignChange(data) {
                this.graphRaw.edges = data.edges;
                this.graphRaw.nodes = data.nodes;

                this.networkDesign = new NetworkDesignClass();
                this.networkDesign.setEdges(data.edges);
                this.networkDesign.setNodes(data.nodes);
            },
            /**
             * Normalized data using this.normalizer (lib/Normalizer.js)
             */
            normalizeData() {
                this.normalizer.setData(this.data);
                this.normalizer.normalize();
            },
            /**
             * Loads content of file
             */
            loadFromFile(data) {
                let fr = new FileReader();
                fr.onload = (data) => {
                    try {
                        let parsedData = JSON.parse(data.currentTarget.result);
                        this.loadConfig(parsedData);
                    } catch (e) {
                        alert("Chyba při načítání")
                    }
                    this.loadConfig(data);
                };
                fr.readAsText(data.target.files[0]);
            },
            /**
             * Loads configuration from file
             */
            loadConfig(parsedData) {
                if (parsedData.configuration !== undefined && parsedData.data !== undefined && parsedData.graphRaw !== undefined) {
                    this.configuration = parsedData.configuration;
                    this.data = parsedData.data;
                    this.graphRaw = parsedData.graphRaw;
                } else {
                    throw "error";
                }
            },
            /**
             * Loads content of csv file
             */
            loadFromFileCsv(data) {
                let fr = new FileReader();
                fr.onload = (dataLoad) => {
                    let parsedData = this.processCsvData(dataLoad.currentTarget.result, data);
                    let inputCols = data.input.split(",");
                    let outputCols = data.output.split(",");

                    this.configuration.inputs = inputCols.length;
                    this.configuration.outputs = outputCols.length;

                    this.data = [];
                    for (let line of parsedData) {
                        let input = [];
                        let output = [];

                        for (let inputCol of inputCols) {
                            // inputs
                            if (!isNaN(inputCol)) {
                                let parsed = parseFloat(line[inputCol]);
                                if(typeof line[inputCol] !== 'undefined') {
                                    if (isNaN(parsed)) {
                                        input.push(line[inputCol]);
                                    } else {
                                        input.push(parsed);
                                    }
                                }
                            }
                        }
                        for (let outputCol of outputCols) {
                            // outputs
                            if (!isNaN(outputCol)) {
                                let parsed = parseFloat(line[outputCol]);
                                if(typeof line[outputCol] !== 'undefined') {
                                    if (isNaN(parsed)) {
                                        output.push(line[outputCol]);
                                    } else {
                                        output.push(parsed);
                                    }
                                }
                            }
                        }
                        if(input.length > 0 && output.length > 0) {
                            // gets the row only if it's not corrupted
                            this.data.push({
                                input: input,
                                output: output
                            })
                        }
                    }
                    if(this.data.length === 0) {
                        alert("Chyba při načítání");
                    } else {
                        this.$refs.inputData.setActiveTab('custom');
                    }
                };
                fr.readAsText(data.fileData.target.files[0]);
            },
            /**
             * parses csv file
             */
            processCsvData(allText, settings) {
                let allTextLines = allText.match(/[^\r\n]+/g);
                let lines = [];

                for (let i = (settings.firstRowNames ? 1 : 0); i < allTextLines.length; i++) {
                    let data = allTextLines[i].split(settings.delimiter);
                    let tarr = [];
                    for (let j = 0; j < data.length; j++) {
                        tarr.push(data[j]);
                    }
                    lines.push(tarr);
                }
                return lines;
            },
            /**
             * Saves configuration file
             */
            saveFile() {
                let epoch = new Date().getTime();
                let data = {
                    configuration: this.configuration,
                    data: this.data,
                    graphRaw: this.graphRaw
                };

                let file = new File([JSON.stringify(data)], "vi-neural-" + epoch + ".vins", {type: "text/plain;charset=utf-8"});
                FileSaver.saveAs(file);
            }
        }
    }
</script>

<style lang="scss">

    #network {
        text-align: center;
        margin-top: 15px;

        table {
            margin: 0 auto;
            text-align: left;
        }

        .mb {
            margin-bottom: 5px;
        }
    }

    .cursor-pointer {
        cursor: pointer;
    }
</style>
