export default class Normalizer {
    constructor(data) {
        this.data = data;
    }

    normalize() {
        this.normalizedData = [];
        if (!this.metadata) {
            this.analyzeMetadata();
        }
        for (let data of this.data) {
            let input = [];
            let output = [];
            for (let i = 0; i < this.metadata.input.length; i++) {
                if (this.metadata.input[i].type === 'number') {
                    let min = this.metadata.input[i].min;
                    let max = this.metadata.input[i].max;
                    let minmax = (data.input[i] - min) / (max - min);
                    input.push(minmax);
                } else if (this.metadata.input[i].type === 'string') {
                    for(let binary of this.metadata.input[i].binarized[data.input[i]]) {
                        input.push(binary);
                    }
                }
            }
            for (let i = 0; i < this.metadata.output.length; i++) {
                if (this.metadata.output[i].type === 'number') {
                    let min = this.metadata.output[i].min;
                    let max = this.metadata.output[i].max;
                    let minmax = (data.output[i] - min) / (max - min);
                    input.push(minmax);
                } else if (this.metadata.output[i].type === 'string') {
                    for(let binary of this.metadata.output[i].binarized[data.output[i]]) {
                        input.push(binary);
                    }
                }
            }
            this.normalizedData.push({
                input: input,
                output: output
            });
        }
    };

    deNormalizeData(data) {

    }

    getNormalizedData() {
        return this.normalizedData;
    }

    getInputCount() {
        return this.normalizedData[0].input.length;
    }

    getOutputCount() {
        return this.normalizedData[0].output.length;
    }

    setMetadata(metadata) {
        this.metadata = metadata;
    }

    getMetadata() {
        return this.metadata;
    }

    analyzeMetadata() {
        this.metadata = {
            input: [],
            output: []
        };
        let types = this.getTypes();
        let mins = this.getMins();
        let maxes = this.getMaxes();
        let distinct = this.getDistinctValues();
        for (let i in types.input) {
            let metadata = {};
            metadata.type = types.input[i];
            if (metadata.type == 'number') {
                metadata.min = mins.input[i];
                metadata.max = maxes.input[i];
            } else if (metadata.type == 'string') {
                metadata.binarized = this.binarize(distinct.input[i]);
            }
            this.metadata.input.push(metadata);
        }
        for (let i in types.output) {
            let metadata = {};
            metadata.type = types.output[i];
            if (metadata.type == 'number') {
                metadata.min = mins.output[i];
                metadata.max = maxes.output[i];
            } else if (metadata.type == 'string') {
                metadata.binarized = this.binarize(distinct.output[i]);
            }
            this.metadata.output.push(metadata);
        }
    }

    getTypes() {
        let types = {
            input: [],
            output: []
        };
        for (let i in this.data[0].input) {
            types.input[i] = 'number';
            for (let data of this.data) {
                if (typeof(data.input[i]) == 'string') {
                    types.input[i] = 'string';
                }
            }
        }
        for (let i in this.data[0].output) {
            types.output[i] = 'number';
            for (let data of this.data) {
                if (typeof(data.output[i]) == 'string') {
                    types.output[i] = 'string';
                }
            }
        }
        return types;
    }

    getMins() {
        let mins = {
            input: [],
            output: []
        };
        for (let i = 0; i < this.data[0].input.length; i++) {
            mins.input[i] = this.data[0].input[i];
            for (let data of this.data) {
                if (data.input[i] < mins.input[i]) {
                    mins.input[i] = data.input[i];
                }
            }
        }
        for (let i = 0; i < this.data[0].output.length; i++) {
            mins.output[i] = this.data[0].output[i];
            for (let data of this.data) {
                if (data.output[i] < mins.output[i]) {
                    mins.output[i] = data.output[i];
                }
            }
        }
        return mins;
    }

    getMaxes() {
        let maxes = {
            input: [],
            output: []
        };
        for (let i = 0; i < this.data[0].input.length; i++) {
            maxes.input[i] = this.data[0].input[i];
            for (let data of this.data) {
                if (data.input[i] > maxes.input[i]) {
                    maxes.input[i] = data.input[i];
                }
            }
        }
        for (let i = 0; i < this.data[0].output.length; i++) {
            maxes.output[i] = this.data[0].output[i];
            for (let data of this.data) {
                if (data.output[i] > maxes.output[i]) {
                    maxes.output[i] = data.output[i];
                }
            }
        }
        return maxes;
    }

    getDistinctValues() {
        let distinct = {
            input: [],
            output: []
        };
        for (let i = 0; i < this.data[0].input.length; i++) {
            distinct.input[i] = [];
            for (let data of this.data) {
                if (distinct.input[i].indexOf(data.input[i]) === -1) {
                    distinct.input[i].push(data.input[i].toString());
                }
            }
        }
        for (let i = 0; i < this.data[0].output.length; i++) {
            distinct.output[i] = [];
            for (let data of this.data) {
                if (distinct.output[i].indexOf(data.output[i]) === -1) {
                    distinct.output[i].push(data.output[i].toString());
                }
            }
        }
        return distinct;
    }

    binarize(distinct) {
        let binarized = {};
        let length = distinct.length;
        for (let i = 0; i < length; i++) {
            binarized[distinct[i]] = [];
            for (let j = 0; j < length; j++) {
                binarized[distinct[i]][j] = i == j ? 1 : 0;
            }
        }
        return binarized;
    }
}