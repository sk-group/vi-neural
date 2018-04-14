<template>
    <div>
        <h1>Hi please add data</h1>
        <div>
            <div class="row text-left">
                <!--<div class="form-group">-->
                <!--<label for="hidden">Hidden layer</label>-->
                <!--<input v-model.number="configuration.hidden" id="hidden" type="number"/>-->
                <!--</div>-->
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
            <ul class="nav nav-tabs mt-5 mb-3">
                <li class="nav-item" @click="setActiveTab('image')">
                    <span class="nav-link cursor-pointer" :class="{'active': tabs.image}">Data from image</span>
                </li>
                <li class="nav-item" @click="setActiveTab('custom')">
                    <span class="nav-link cursor-pointer" :class="{'active': tabs.custom}">Custom data</span>
                </li>
            </ul>
            <div v-if="tabs.image">
            <div class="image-select mx-auto" @click="addPoint">
                <span v-for="point in imagePoints" class="point" :class="[point.color]" :style="{left: point.left+'%', top: point.top+'%'}"></span>
            </div>
            </div>
            <div v-if="tabs.custom">
                <table class="table table-primary table-striped table-data">
                    <thead>
                    <tr class="bg-primary">
                        <th>Inputs</th>
                        <th>Outputs</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="i in data.length">
                        <td>
                            <template v-for="j in configuration.inputs">
                                {{j}}. input <input v-model.number="data[i - 1].input[j - 1]" type="number" class="form-control mb-1 form-control-sm"/><br>
                            </template>
                        </td>
                        <td>
                            <template v-for="j in configuration.outputs">
                                {{j}}. output <input v-model.number="data[i - 1].output[j - 1]" type="number" class="form-control mb-1 form-control-sm"/><br>
                            </template>
                        </td>
                        <td class="text-right">
                            <button @click="removeData(i - 1)" class="btn btn-danger">-</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <div class="text-right mt-2 mb-3">
                    <button @click="addData()" class="btn btn-success">+</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>


    export default {
        name: "InputData",
        props: ['configuration', 'data'],
        data(){
            return{
                tabs: {
                    image: true,
                    custom: false
                },
                imagePoints: []
            }
        },
        methods:{
            addData() {
                this.data.push({
                    input: [],
                    output: []
                });
            },
            removeData(index) {
                this.data.splice(index, 1);
            },
            setActiveTab(type){
                for(let tab in this.tabs){
                    this.tabs[tab] = false;
                }

                this.tabs[type] = true;
            },
            addPoint(e){
                console.log(e.screenX, e.screenY);
                console.log(e.target.getBoundingClientRect());
            }
        }
    }
</script>

<style lang="scss">
    .table-data{
        input{
            width: 50%;
            display: inline-block;
        }

        th{
            color: #fff;
        }
    }

    .image-select{
        width: 25vw;
        height: 25vw;
        border: 1px solid #ccc;
    }
</style>