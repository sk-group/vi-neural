<template>
    <div>
        <h1>Design network</h1>
        <div class="text-center mb-3">
            <span
                    class="btn btn-primary"
                    @click="generateInputOutput()"
            >Generate again</span>
            <span
                    class="btn btn-primary"
                    @click="generateInputOutput(true, true)"
            >Clear</span>
        </div>
        <div id="mynetwork"></div>
    </div>
</template>

<script>
    import NetworkDesign from "../lib/NetworkDesign";

    let vis = require('../../node_modules/vis/index');
    let network = null;
    let dataGlobalDefault = {
        nodes: [
            {id: "0", label: ""},
            {id: "1", label: ""},
            {id: "2", label: ""},
        ],
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
        props: ['configuration'],
        data(){
            return{
                design: null
            }
        },
        created(){
            this.generateInputOutput(false);
            this.design = new NetworkDesign();
        },
        watch:{
            configuration: {
                handler: function (val, oldVal) {
                    this.generateInputOutput();
                },
                deep: true
            }
        },
        mounted(){
            this.draw();
        },
        methods: {
            generateInputOutput(canDraw = true, clearAll = false){
                if(clearAll){
                    dataGlobal = {
                        nodes: [],
                        edges: []
                    }
                }else{
                    dataGlobal = JSON.parse(JSON.stringify(dataGlobalDefault));
                }

                for(let i = 0; i < this.configuration.inputs; i++){
                    dataGlobal.nodes.push({
                        id: "input-"+i,
                        label: "Input "+(i+1),
                        fixed: true,
                        x: 0,
                        y: 100*i,
                        color: '#8cffaa'
                    });

                    for(let y = 0; y < 3; y++){
                        dataGlobal.edges.push({
                            from: "input-"+i,
                            to: y,
                            id: getUid(),
                            arrows: "to"
                        });
                    }
                }

                for(let i = 0; i < this.configuration.outputs; i++){
                    dataGlobal.nodes.push({
                        id: "output-"+i,
                        label: "Output "+(i+1),
                        fixed: true,
                        x: 700,
                        y: 100*i,
                        color: '#ff5b63'
                    });

                    for(let y = 0; y < 3; y++){
                        dataGlobal.edges.push({
                            from: y,
                            to: "output-"+i,
                            id: getUid(),
                            arrows: "to"
                        });
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
            },
            emmitData(data){
                this.design.setEdges(data.edges);
                this.design.setNodes(data.nodes);
                this.$emit('graph-change', this.design);
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