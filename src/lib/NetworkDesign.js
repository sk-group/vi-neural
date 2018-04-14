export default class NetworkDesign{
    constructor(){
        this.edges = [];
        this.nodes = [];
    }

    setEdges(data){
        this.edges = [];

        for(let edge of data){
            this.edges.push(new Edge(edge.id, edge.from, edge.to))
        }
    }

    setNodes(data){
        this.nodes = [];

        for(let node of data){
            this.nodes.push(new Node(node.id))
        }
    }

    getNodeOuts(nodeId){
        let returnArr  = [];
        for(let edge of this.edges){
            if(edge.from === nodeId){
                returnArr.push(edge.to)
            }
        }
        return returnArr;
    }

    getNodeIns(nodeId){
        let returnArr  = [];
        for(let edge of this.edges){
            if(edge.to === nodeId){
                returnArr.push(edge.from)
            }
        }
        return returnArr;
    }
}

class Edge{
    constructor(id, from, to){
        this.id = id;
        this.from = from;
        this.to = to;
    }
}

class Node{
    constructor(id, label = ""){
        this.id = id;
        this.label = label;
    }
}