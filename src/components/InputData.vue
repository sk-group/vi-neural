<template>
    <div>
        <h2>Nastavení sítě</h2>
        <div>
            <div class="row text-left mb-5">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="inputs">Počet vstupů</label>
                        <input v-model.number="configuration.inputs" id="inputs" type="number" class="form-control" min="1"/>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="outputs">Počet výstupů</label>
                        <input v-model.number="configuration.outputs" id="outputs" type="number" class="form-control" min="1"/>
                    </div>
                </div>
            </div>
            <h2>Data pro síť</h2>
            <div class="text-center mb-3">
                <span class="btn btn-outline-primary btn-sm" @click="loadDummy('and')">And</span>
                <span class="btn btn-outline-primary btn-sm" @click="loadDummy('or')">Or</span>
                <span class="btn btn-outline-primary btn-sm" @click="loadDummy('xor')">Xor</span>
                <span class="btn btn-outline-primary btn-sm" @click="loadDummy('vrtule')">Vrtule</span>
                <span class="btn btn-outline-primary btn-sm" @click="loadDummy('kruh')">Kruh</span>
                <span class="btn btn-outline-primary btn-sm" @click="loadDummy('mnoziny')">Množiny</span>
                <span class="btn btn-outline-primary btn-sm" @click="loadDummy('string')">Řetězec jako výstup</span>
                <span class="btn btn-outline-primary btn-sm" @click="loadDummy('iris')">Iris</span>
            </div>
            <ul class="nav nav-tabs mb-3 justify-content-center">
                <li class="nav-item" @click="setActiveTab('image')" v-if="normalizedInputs == 2 && (normalizedOutputs == 1 || (configuration.outputs == 1 && metadata.output[0].type == 'string'))">
                    <span class="nav-link cursor-pointer" :class="{'active': tabs.image}">Výběr z obrázku</span>
                </li>
                <li class="nav-item" @click="setActiveTab('custom')">
                    <span class="nav-link cursor-pointer" :class="{'active': tabs.custom}">Vlastní data</span>
                </li>
                <li class="nav-item" @click="setActiveTab('csv')">
                    <span class="nav-link cursor-pointer" :class="{'active': tabs.csv}">Vložit csv data</span>
                </li>
                <li class="nav-item" @click="setActiveTab('importTab')">
                    <span class="nav-link cursor-pointer" :class="{'active': tabs.importTab}">Vložit konfigurační soubor</span>
                </li>
            </ul>
            <div v-if="tabs.image">
                <div v-if="normalizedInputs == 2 && (normalizedOutputs == 1 || (configuration.outputs == 1 && metadata.output[0].type == 'string'))">
                    <div class="form-group mx-auto w-50">
                        <label for="imageSelectOutput">Výstupní hodnota</label>
                        <ul class="nav nav-tabs mb-3 justify-content-center">
                            <li class="nav-item" @click="outputType = 'number'">
                                <span class="nav-link cursor-pointer" :class="{'active': outputType === 'number'}">Čísla</span>
                            </li>
                            <li class="nav-item" @click="outputType = 'string'">
                                <span class="nav-link cursor-pointer" :class="{'active': outputType === 'string'}">Řetězce</span>
                            </li>
                        </ul>
                        <template v-if="outputType === 'number'">
                            <vue-slider id="imageSelectOutput" v-model.number="imageSelectOutput" :min="0" :max="1" :interval="0.05"/>
                        </template>
                        <div v-else-if="outputType === 'string'" class="row text-left">
                            <div class="col-md-6">
                                <label for="imageSelectOutput-select">Existující</label>
                                <select id="imageSelectOutput-select" v-model="imageSelectOutput" class="form-control mb-3">
                                    <option v-for="output in metadata.output[0].binarized"
                                            :value="normalizer.deNormalizeOutput(output)[0]"
                                            :style="{
                                                color: getColor(output)
                                            }">{{ normalizer.deNormalizeOutput(output)[0] }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="imageSelectOutput-text">Vlastní</label>
                                <input id="imageSelectOutput-text" v-model="imageSelectOutput" class="form-control mb-3"/>
                            </div>
                        </div>
                    </div>
                    <div class="image-select-wrapper mx-auto">
                        <Axis :min="0" :max="1"/>
                        <Axis vertical="true" :min="0" :max="1"/>
                        <div class="image-select" @click="addPoint" ref="imageSelect">
                            <div class="image-inner">
                        <span v-for="(data, index) in data" class="point"
                              :title="data.input[0].toFixed(2) + ', ' + data.input[1].toFixed(2) + ' => ' + data.output[0]"
                              :style="{
                                  left: data.input[0] * 100 + '%',
                                  top: data.input[1] * 100 +'%',
                                  backgroundColor: getColor(metadata.output[0].type === 'number' ? data.output : metadata.output[0].binarized[data.output[0]])}"
                              @click.stop="removePoint(index)"></span>
                            </div>
                        </div>
                        <Axis bottom="true" :min="0" :max="1"/>
                        <Axis vertical="true" bottom="true" :min="0" :max="1"/>
                    </div>
                </div>
            </div>
            <div v-if="tabs.custom" class="custom-data-wrap">
                <table class="table table-primary table-striped table-data">
                    <thead>
                    <tr class="bg-primary">
                        <th>Vstupy</th>
                        <th>Výstupy</th>
                        <th class="text-right">
                            <button @click="addData()" class="btn btn-success btn-sm">+</button>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="i in data.length">
                        <td>
                            <template v-for="j in configuration.inputs">
                                {{j}}. vstup <input v-model.number="data[i - 1].input[j - 1]" class="form-control mb-1 form-control-sm"/><br>
                            </template>
                        </td>
                        <td>
                            <template v-for="j in configuration.outputs">
                                {{j}}. výstup <input v-model.number="data[i - 1].output[j - 1]" class="form-control mb-1 form-control-sm"/><br>
                            </template>
                        </td>
                        <td class="text-right">
                            <button @click="removeData(i - 1)" class="btn btn-danger btn-sm">-</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="tabs.csv">
                <div class="row">
                    <div class="col-md-6 offset-md-3 text-left">
                        <div class="custom-file mb-3">
                            <input type="file" class="custom-file-input cursor-pointer" id="inputGroupFile01" accept=".csv" @change="fileUploadCsv">
                            <label class="custom-file-label" for="inputGroupFile01">Vložte csv soubor</label>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" v-model="csv.firstRowNames">
                            <label class="form-check-label">Obsahuje první řádek názvy?</label>
                        </div>
                        <div class="form-group">
                            <label>Odělovač</label>
                            <input type="text" class="form-control" v-model="csv.delimiter">
                        </div>
                        <p class="text-muted mt-4 mb-0">Slopuce oddělte čárkou, začínají číslem 0</p>
                        <div class="form-group">
                            <label>Vstupy</label>
                            <input type="text" class="form-control" v-model="csv.input">
                        </div>
                        <div class="form-group">
                            <label>Výstupy</label>
                            <input type="text" class="form-control" v-model="csv.output">
                        </div>
                        <div class="form-group">
                            <span class="btn btn-primary cursor-pointer" @click="$emit('load-csv', csv)">Nahrát</span>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="tabs.importTab">
                <div class="row">
                    <div class="col-md-6 offset-md-3">
                        <div class="text-left">
                            <div class="custom-file">
                                <input type="file" class="custom-file-input" id="inputGroupFile04" accept=".vins" @change="fileUpload">
                                <label class="custom-file-label" for="inputGroupFile04">Vložte soubor</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="text-right mt-3">
                <span
                        class="btn btn-success btn-lg cursor-pointer"
                        @click="$emit('next')"
                >
                    Další krok
                </span>
            </div>
        </div>
    </div>
</template>

<script>
    import Axis from './Axis';
    import vueSlider from 'vue-slider-component'
    import Normalizer from '../lib/Normalizer';
    import getColor from '../lib/ColorHelpers';

    export default {
        name: "InputData",
        props: ['configuration', 'data', 'normalizedInputs', 'normalizedOutputs', 'metadata'],
        components: {
            Axis,
            vueSlider
        },
        data() {
            return {
                tabs: {
                    image: true,
                    custom: false,
                    importTab: false,
                    csv: false
                },
                imageSelectOutput: this.data[0].output[0],
                csv: {
                    delimiter: ',',
                    firstRowNames: false,
                    fileData: null,
                    input: "",
                    output: "",
                },
                dummyData: require('../lib/DummyData'),
                outputType: 'number',
                normalizer: new Normalizer(this.metadata),
                getColor: getColor
            }
        },
        watch: {
            configuration: {
                handler(val) {
                    if (val.inputs != 2 || val.outputs != 1) {
                        this.setActiveTab('custom');
                    }
                    for (let data of this.data) {
                        for (let i = val.inputs; i < data.input.length; i++) {
                            data.input.splice(val.inputs, 1);
                        }
                        for (let i = data.input.length; i < val.inputs; i++) {
                            data.input.push("");
                        }
                    }
                    for (let data of this.data) {
                        for (let i = val.outputs; i < data.output.length; i++) {
                            data.output.splice(val.outputs, 1);
                        }
                        for (let i = data.output.length; i < val.outputs; i++) {
                            data.output.push("");
                        }
                    }
                },
                deep: true
            },
            data: {
                handler() {
                    let type = this.metadata.output[0].type;
                    if (this.outputType !== type) {
                        switch (type) {
                            case 'number':
                                this.imageSelectOutput = 0;
                                break;
                            case 'string':
                                this.imageSelectOutput = Object.keys(this.metadata.output[0].binarized)[0];
                                break;
                        }
                    }
                    this.outputType = type;
                },
                deep: true
            }
        },
        methods: {
            addData() {
                let newData = {
                    input: [],
                    output: []
                };
                for (let i = 0; i < this.configuration.inputs; i++) {
                    newData.input.push("");
                }
                for (let i = 0; i < this.configuration.outputs; i++) {
                    newData.output.push("");
                }
                this.data.push(newData);
            },
            removeData(index) {
                this.data.splice(index, 1);
            },
            setActiveTab(type) {
                for (let tab in this.tabs) {
                    this.tabs[tab] = false;
                }

                this.tabs[type] = true;
            },
            addPoint(e) {
                let imageSelect = this.$refs.imageSelect;
                let output = parseFloat(this.imageSelectOutput);
                if (isNaN(output)) {
                    output = this.imageSelectOutput;
                }
                this.data.push({
                    input: [
                        parseFloat(e.offsetX / imageSelect.clientWidth),
                        parseFloat(e.offsetY / imageSelect.clientHeight)
                    ],
                    output: [
                        output
                    ]
                });
            },
            removePoint(index) {
                this.data.splice(index, 1);
            },
            fileUpload(data) {
                this.$emit('load', data)
            },
            loadDummy(type) {
                this.$emit('load-dummy', this.dummyData[type])
            },
            fileUploadCsv(data) {
                this.csv.fileData = data;
            }
        }
    }
</script>

<style lang="scss">
    .custom-data-wrap {
        max-height: 800px;
        overflow: auto;
    }

    .table-data {
        input {
            width: 50%;
            display: inline-block;
        }

        th {
            color: #fff;
        }
    }

    .vue-slider-component {
        cursor: pointer;
    }

    .image-select-wrapper {
        margin-top: 30px;
        position: relative;
        padding: 20px;
        width: 540px;
        height: 540px;
    }

    .image-select {
        width: 500px;
        height: 500px;
        border: 1px solid #ccc;
        position: relative;
        background: #eee;

        .image-inner {
            height: 100%;
            width: 100%;
            transform: scaleY(-1);
            cursor: crosshair;

            .point {
                width: 11px;
                height: 11px;
                border-radius: 50%;
                border: 2px solid dodgerblue;
                margin-left: -5.5px;
                margin-top: -5.5px;
                position: absolute;
                background-color: black;
                cursor: pointer;
            }
        }
    }
</style>