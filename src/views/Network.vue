<template>
    <div id="network">
        <Progress :appFlow="appFlow"></Progress>
        <div class="container pb-5">
            <InputData
                    v-if="isVisible('inputData')"
                    :configuration="configuration"
                    :normalizedInputs="normalizedInputs"
                    :normalizedOutputs="normalizedOutputs"
                    :data="data"
                    @next="show('design')"
                    @load="loadFromFile"
            ></InputData>
            <NetworkDesign
                    v-if="isVisible('design')"
                    :inputs="normalizedInputs"
                    :outputs="normalizedOutputs"
                    :hiddenLayers="configuration.hidden"
                    :dataGlobal="graphRaw"
                    @graph-change="networkDesignChange"
                    @next="show('result')"
            ></NetworkDesign>
            <Result
                    v-if="isVisible('result')"
                    :configuration="configuration"
                    :data="normalizedData"
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
                handler() {
                    this.normalizeData();
                },
                deep: true
            }
        },
        computed: {
            normalizedInputs() {
                let normalizedInputs = this.normalizer.getInputCount();
                if(normalizedInputs === 0) {
                    return this.configuration.inputs;
                }
                return normalizedInputs;
            },
            normalizedOutputs() {
                let normalizedOutputs = this.normalizer.getOutputCount();
                if(normalizedOutputs === 0) {
                    return this.configuration.outputs;
                }
                return this.normalizer.getOutputCount();
            },
            normalizedData() {
                return this.normalizer.getNormalizedData();
            },
            metadata() {
                return this.normalizer.getMetadata();
            }
        },
        data(){
            return{
                graphRaw: {
                    nodes: [],
                    edges: []
                },
                configuration: {
                    inputs: 2,
                    hidden: [
                        {
                            count: 3
                        }
                    ],
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
                normalizer: null
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
                let findActive = false;
                for(let section in this.appFlow){
                    if (!this.appFlow.hasOwnProperty(section))
                        continue;

                    if(!findActive){
                        this.appFlow[section].disabled = false;
                    }

                    if(this.appFlow[section].active){
                        findActive = true;
                    }
                }
            },
            isVisible(name){
                return this.appFlow[name].active || process.env.NODE_ENV === 'development';
            },
            networkDesignChange(data){
                this.graphRaw.edges = data.edges;
                this.graphRaw.nodes = data.nodes;

                this.networkDesign = new NetworkDesignClass();
                this.networkDesign.setEdges(data.edges);
                this.networkDesign.setNodes(data.nodes);
            },
            normalizeData() {
                this.normalizer = new Normalizer();
                this.normalizer.setData(this.data);
                this.normalizer.normalize();
            },
            loadFromFile(data){
                let fr = new FileReader();
                fr.onload = (data) =>{
                    try{
                        let parsedData = JSON.parse(data.currentTarget.result);

                        if(parsedData.configuration !== undefined && parsedData.data !== undefined && parsedData.graphRaw !== undefined){
                            this.configuration = parsedData.configuration;
                            this.data = parsedData.data;
                            this.graphRaw = parsedData.graphRaw;
                            this.show('result');
                        }else{
                            throw "error";
                        }
                    }catch(e){
                        alert("Chyba při načítání")
                    }
                };
                fr.readAsText(data.target.files[0]);
            },
            saveFile(){
                let epoch = new Date().getTime();
                let data ={
                    configuration: this.configuration,
                    data: this.data,
                    graphRaw: this.graphRaw
                };

                let file = new File([JSON.stringify(data)], "vi-neural-"+epoch+".vins", {type: "text/plain;charset=utf-8"});
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

    .cursor-pointer{
        cursor: pointer;
    }
</style>
