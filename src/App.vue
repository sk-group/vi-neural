<template>
    <div id="app">
        <Progress :appFlow="appFlow"></Progress>
        <div class="container pb-5">
            <InputData
                    v-if="isVisible('inputData')"
                    :configuration="configuration"
                    :normalizedInputs="normalizedInputs"
                    :normalizedOutputs="normalizedOutputs"
                    :data="data"
                    @next="show('design')"
            ></InputData>
            <NetworkDesign
                    v-if="isVisible('design')"
                    :inputs="normalizedInputs"
                    :outputs="normalizedOutputs"
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
            ></Result>
        </div>
    </div>
</template>

<script>
    import Progress from './components/Progress.vue';
    import InputData from './components/InputData.vue';
    import NetworkDesign from './components/NetworkDesign.vue';
    import Result from './components/Result.vue';
    import Normalizer from './lib/Normalizer';

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
                return this.normalizer.getInputCount()
            },
            normalizedOutputs() {
                return this.normalizer.getOutputCount()
            },
            normalizedData() {
                return this.normalizer.getNormalizedData()
            },
            metadata() {
                return this.normalizer.getMetadata()
            }
        },
        data(){
            return{
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
                this.networkDesign = data;
                console.log("Network: ", this.networkDesign);
            },
            normalizeData() {
                this.normalizer = new Normalizer(this.data);
                this.normalizer.normalize();
            }
        }
    }
</script>

<style lang="scss">
    @import '../node_modules/bootstrap/scss/bootstrap';

    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        text-align: center;
        color: #2c3e50;
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
