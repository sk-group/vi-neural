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
            <ul class="nav nav-tabs mb-3 justify-content-center">
                <li class="nav-item" @click="setActiveTab('image')">
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
                <div v-if="normalizedInputs == 2 && normalizedOutputs == 1">
                    <!--TODO add dummy data on button click-->
                    <div class="form-group mx-auto w-50">
                        <label for="imageSelectOutput">Výstupní hodnota</label>
                        <vue-slider id="imageSelectOutput" v-model.number="imageSelectOutput" :min="0" :max="1" :interval="0.05"/>
                    </div>
                    <div class="image-select-wrapper mx-auto">
                        <Axis :min="0" :max="1"/>
                        <Axis vertical="true" :min="0" :max="1"/>
                        <div class="image-select" @click="addPoint" ref="imageSelect">
                            <div class="image-inner">
                        <span v-for="(data, index) in data" class="point" :style="{
                            left: data.input[0] * 100 + '%',
                            top: data.input[1] * 100 +'%',
                            backgroundColor: 'rgba(' + Math.round(255 * data.output[0]) + ',' + Math.round(255 * data.output[0]) + ',' + Math.round(255 * data.output[0]) + ',1)' }"
                              @click.stop="removePoint(index)"></span>
                            </div>
                        </div>
                        <Axis bottom="true" :min="0" :max="1"/>
                        <Axis vertical="true" bottom="true" :min="0" :max="1"/>
                    </div>
                </div>
            </div>
            <div v-if="tabs.custom">
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
                            <input type="file" class="custom-file-input" id="inputGroupFile01" accept=".csv" @change="fileUploadCsv">
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
                        <p class="text-muted mt-4 mb-0">Sloupečky začínají 0 a oddělte čárkou</p>
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

    export default {
        name: "InputData",
        props: ['configuration', 'data', 'normalizedInputs', 'normalizedOutputs'],
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
                imageSelectOutput: 0,
                csv: {
                    delimiter: ',',
                    firstRowNames: false,
                    fileData: null,
                    input: "",
                    output: "",
                }
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
                this.data.push({
                    input: [
                        e.offsetX / imageSelect.clientWidth,
                        e.offsetY / imageSelect.clientHeight
                    ],
                    output: [
                        this.imageSelectOutput
                    ]
                });
            },
            removePoint(index) {
                this.data.splice(index, 1);
            },
            fileUpload(data) {
                this.$emit('load', data)
            },
            fileUploadCsv(data){
                this.csv.fileData = data;
            }
        }
    }
</script>

<style lang="scss">
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