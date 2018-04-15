<template>
    <div>
        <h2>Nastavení sítě</h2>
        <div>
            <div class="row text-left mb-5">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="inputs">Input layer</label>
                        <input v-model.number="configuration.inputs" id="inputs" type="number" class="form-control" min="1"/>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="outputs">Output layer</label>
                        <input v-model.number="configuration.outputs" id="outputs" type="number" class="form-control" min="1"/>
                    </div>
                </div>
                <div class="col-md-12">
                    <div class="form-group">
                        <label for="iterations">Iterations</label>
                        <input v-model.number="configuration.iterations" id="iterations" type="number" class="form-control"/>
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
            </ul>
            <div v-if="tabs.image">
                <div v-if="configuration.inputs == 2 && configuration.outputs == 1">
                    <div class="form-group">
                        <label for="imageSelectOutput">Output</label>
                        <input v-model.number="imageSelectOutput" id="imageSelectOutput" type="number" class="form-control" max="1"/>
                    </div>
                    <div class="image-select mx-auto" @click="addPoint" ref="imageSelect">
                        <div class="image-inner">
                <span v-for="(data, index) in data" class="point" :style="{
                    left: data.input[0] * 100 + '%',
                    top: data.input[1] * 100 +'%',
                    backgroundColor: 'rgba(' + Math.round(255 * data.output[0]) + ',' + Math.round(255 * data.output[0]) + ',' + Math.round(255 * data.output[0]) + ',1)' }"
                      @click="removePoint(index, $event)"></span>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="tabs.custom">
                <table class="table table-primary table-striped table-data">
                    <thead>
                    <tr class="bg-primary">
                        <th>Inputs</th>
                        <th>Outputs</th>
                        <th class="text-right"><button @click="addData()" class="btn btn-success btn-sm">+</button></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="i in data.length">
                        <td>
                            <template v-for="j in configuration.inputs">
                                {{j}}. input <input v-model.number="data[i - 1].input[j - 1]" class="form-control mb-1 form-control-sm"/><br>
                            </template>
                        </td>
                        <td>
                            <template v-for="j in configuration.outputs">
                                {{j}}. output <input v-model.number="data[i - 1].output[j - 1]" class="form-control mb-1 form-control-sm"/><br>
                            </template>
                        </td>
                        <td class="text-right">
                            <button @click="removeData(i - 1)" class="btn btn-danger btn-sm">-</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
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


    export default {
        name: "InputData",
        props: ['configuration', 'data'],
        data() {
            return {
                tabs: {
                    image: true,
                    custom: false
                },
                imageSelectOutput: 0
            }
        },
        watch: {
            configuration: {
                handler(val) {
                    if(val.inputs != 2 || val.outputs != 1) {
                        this.setActiveTab('custom');
                    }
                    for(let data of this.data) {
                        for(let i = val.inputs; i < data.input.length; i++) {
                            data.input.splice(val.inputs, 1);
                        }
                    }
                    for(let data of this.data) {
                        for(let i = val.outputs; i < data.output.length; i++) {
                            data.output.splice(val.outputs, 1);
                        }
                    }
                },
                deep: true
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
            removePoint(index, e) {
                e.stopPropagation();
                this.data.splice(index, 1);
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

    .image-select {
        width: 25vw;
        height: 25vw;
        border: 1px solid #ccc;
        position: relative;
        background: grey;

        .image-inner {
            height: 100%;
            width: 100%;
            transform: scaleY(-1);

            .point {
                width: 9px;
                height: 9px;
                margin-left: -4.5px;
                margin-top: -4.5px;
                position: absolute;
                background-color: black;
            }
        }
    }
</style>