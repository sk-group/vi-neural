<template>
    <div>
        <h1>Návrh sítě</h1>
        <h4>Vnitřní vrstvy</h4>
        <div class="hidden-layers">
            <div class="row">
                <div class="col" v-for="(item, index) in hiddenLayers">
                    <div class="input-group mb-2">
                        <input type="number"  v-model="item.count" class="form-control" />
                        <div class="input-group-append">
                            <span class="input-group-text bg-danger" @click="removeHiddenLayer(index)" style="color: #fff;">-</span>
                        </div>
                    </div>
                </div>
                <div class="col-1 text-right">
                    <span class="btn btn-success" @click="addHiddenLayer">+</span>
                </div>
            </div>
        </div>
        <div class="text-center mb-3">
            <span
                    class="btn btn-primary"
                    @click="generateGraphStructure()"
            >Obnovit</span>
            <span
                    class="btn btn-primary"
                    @click="generateGraphStructure(true, false)"
            >Smazat vše</span>
        </div>
        <div id="mynetwork"></div>
        <div class="text-right mt-3">
                <span
                        class="btn btn-success btn-lg cursor-pointer"
                        @click="$emit('next')"
                >
                    Další krok
                </span>
        </div>
    </div>
</template>

<script>
    import NetworkDesign from "../lib/NetworkDesign";

    let vis = require('../../node_modules/vis/index');
    let network = null;
    let dataGlobalDefault = {
        nodes: [],
        edges: []
    };
    let dataGlobal = JSON.parse(JSON.stringify(dataGlobalDefault));

    function destroy() {
        if (network !== null) {
            network.destroy();
            network = null;
        }
    }

    function getUid() {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    export default {
        name: "NetworkDesign",
        props: ['configuration', 'inputs', 'outputs'],
        data(){
            return{
                design: null,
                hiddenLayers:[
                    {
                        count: 3
                    }
                ]
            }
        },
        created(){
            this.generateGraphStructure(false);
            this.design = new NetworkDesign();
        },
        watch:{
            inputs() {
                this.generateGraphStructure();
            },
            outputs() {
                this.generateGraphStructure();
            },
            hiddenLayers: {
                handler(){
                    this.generateGraphStructure();
                },
                deep: true
            }
        },
        mounted(){
            this.draw();
        },
        methods: {
            generateGraphStructure(canDraw = true, hiddenLayers = true){
                dataGlobal = {
                    nodes: [],
                    edges: []
                }

                for(let i = 0; i < this.inputs; i++){
                    dataGlobal.nodes.push({
                        id: "input-"+i,
                        label: "Vstup "+(i+1),
                        fixed: true,
                        x: 0,
                        y: 100*i,
                        color: '#8cffaa'
                    });
                }

                for(let i = 0; i < this.outputs; i++){
                    dataGlobal.nodes.push({
                        id: "output-"+i,
                        label: "Výstup "+(i+1),
                        fixed: true,
                        x: 700,
                        y: 100*i,
                        color: '#ff5b63'
                    });
                }


                if(hiddenLayers){
                    let nodeId = "";
                    for(let it in this.hiddenLayers){

                        for(let y = 0; y < this.hiddenLayers[it].count; y++){
                            nodeId = "hidden-"+it+"-"+y;
                            dataGlobal.nodes.push({
                                id: nodeId,
                                label: "",
                            });

                            if(it == 0){
                                for(let itInput = 0; itInput < this.inputs; itInput++){
                                    dataGlobal.edges.push({
                                        from: "input-"+itInput,
                                        to: nodeId,
                                        id: getUid(),
                                        arrows: "to"
                                    });
                                }
                            }else{
                                for(let itNodeBefore = 0; itNodeBefore < this.hiddenLayers[it-1].count; itNodeBefore++){

                                    dataGlobal.edges.push({
                                        from: "hidden-"+(it-1)+"-"+itNodeBefore,
                                        to: nodeId,
                                        id: getUid(),
                                        arrows: "to"
                                    });
                                }
                            }


                            if(it == (this.hiddenLayers.length-1)){
                                for(let itOutput = 0; itOutput < this.outputs; itOutput++){
                                    dataGlobal.edges.push({
                                        from: nodeId,
                                        to: "output-"+itOutput,
                                        id: getUid(),
                                        arrows: "to"
                                    });
                                }
                            }
                        }
                    }
                }

                if(canDraw){
                    this.draw();
                }
            },
            draw() {
                destroy();

                // create a network
                let container = document.getElementById('mynetwork');

                let options = {
                    layout: { improvedLayout: false },
                    locale: 'en',
                    manipulation: {
                        addNode: (data, callback) =>{
                            data.label = "";
                            callback(data);
                            this.emmitData({
                                nodes: network.body.data.nodes.get(),
                                edges: network.body.data.edges.get()
                            });
                        },
                        addEdge: (data, callback) =>{
                            if(data.to.indexOf("input") > -1 || data.from.indexOf("output") > -1){
                                callback(null);
                            }else{
                                data.arrows = "to";
                                callback(data);

                                this.emmitData({
                                    nodes: network.body.data.nodes.get(),
                                    edges: network.body.data.edges.get()
                                });
                            }
                        },
                        editEdge: (data, callback) =>{
                            if(data.to.indexOf("input") > -1 || data.from.indexOf("output") > -1){
                                callback(null);
                            }else{
                                data.arrows = "to";
                                callback(data);

                                this.emmitData({
                                    nodes: network.body.data.nodes.get(),
                                    edges: network.body.data.edges.get()
                                });
                            }
                        },
                        deleteEdge: (data, callback) =>{
                            callback(data);

                            this.emmitData({
                                nodes: network.body.data.nodes.get(),
                                edges: network.body.data.edges.get()
                            });
                        },
                        deleteNode: (nodeData,callback) =>{
                            if(nodeData.nodes[0].indexOf("input") > -1 ||  nodeData.nodes[0].indexOf("output") > -1){
                                callback(null);
                            }else{
                                callback(nodeData);
                                this.emmitData({
                                    nodes: network.body.data.nodes.get(),
                                    edges: network.body.data.edges.get()
                                });
                            }
                        }
                    }
                };
                network = new vis.Network(container, dataGlobal, options);
                this.emmitData({
                    nodes: network.body.data.nodes.get(),
                    edges: network.body.data.edges.get()
                });
            },
            emmitData(data){
                this.design.setEdges(data.edges);
                this.design.setNodes(data.nodes);
                this.$emit('graph-change', this.design);
            },
            addHiddenLayer(){
                this.hiddenLayers.push({
                    count: 2
                });
            },
            removeHiddenLayer(index){
                this.hiddenLayers.splice(index, 1);
            }
        }
    }
</script>

<style>
    @import "../../node_modules/vis/dist/vis-network.min.css";

    #mynetwork {
        position:relative;
        width: 100%;
        height: 600px;
        border: 1px solid lightgray;
    }
</style>