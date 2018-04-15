export default class Normalizer {
    setData(data) {
        data = JSON.parse(JSON.stringify(data));
        for(let i = 0; i < data.length; i++) {
            let remove = false;
            for(let input of data[i].input) {
                if(input === "") {
                    remove = true;
                }
            }
            for(let output of data[i].output) {
                if(output === "") {
                    remove = true;
                }
            }
            if(remove) {
                data.splice(i, 1);
                i--;
            }
        }
        this.data = data;
    }

    normalize() {
        if(this.data.length === 0) {
            return;
        }
        if(!this.data) {
            console.error('No data to normalize.');
            return;
        }
        this.normalizedData = [];
        if (!this.metadata) {
            this.analyzeMetadata();
        }
        for (let data of this.data) {
            let input = [];
            let output = [];
            if(data.input.length > 0) {
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
            }
            if(data.output.length > 0) {
                for (let i = 0; i < this.metadata.output.length; i++) {
                    if (this.metadata.output[i].type === 'number') {
                        let min = this.metadata.output[i].min;
                        let max = this.metadata.output[i].max;
                        let diff = max - min;
                        let minmax = 0;
                        if (diff !== 0) {
                            minmax = (data.output[i] - min) / diff;
                        }
                        output.push(minmax);
                    } else if (this.metadata.output[i].type === 'string') {
                        for (let binary of this.metadata.output[i].binarized[data.output[i]]) {
                            output.push(binary);
                        }
                    }
                }
            }
            this.normalizedData.push({
                input: input,
                output: output
            });
        }
        console.log('metadata', this.metadata);
    };

    normalizeInput(input) {
        if(!this.metadata) {
            console.error('No metadata to normalize from.');
            return [];
        }
        this.data = [{
            input: input,
            output: []
        }];
        this.normalize();
        this.data = null;
        return this.getNormalizedData()[0].input;
    }

    deNormalizeOutput(output) {
        let denormalizedOutput = [];
        if(!this.metadata) {
            console.error('No metadata to denormalize from.');
            return [];
        }
        let i = 0;
        for(let j = 0; j < this.metadata.output.length; j++) {
            let outputMetadata = this.metadata.output[j];
            if(outputMetadata.type === 'number') {
                //de minmax
                let min = outputMetadata.min;
                let max = outputMetadata.max;
                let diff = max - min;
                denormalizedOutput[j] = min;
                if(diff !== 0) {
                    denormalizedOutput[j] = (output[i] * diff) + min;
                }
                i++;
            } else if (outputMetadata.type === 'string') {
                //de binarize
                let binarized = outputMetadata.binarized;
                let binaryLength = Object.keys(binarized).length;

                let binaryOutput = output.slice(i, i + binaryLength);
                binaryOutput = binaryOutput.map((binary) => {
                    return Math.round(binary);
                });
                let oneIndex = binaryOutput.indexOf(1);
                for(let key in binarized) {
                    if(!binarized.hasOwnProperty(key)) {
                        continue;
                    }
                    if(binarized[key][oneIndex] === 1) {
                        denormalizedOutput[j] = key;
                        break;
                    }
                }
                i += binaryLength;
            }
        }
        return denormalizedOutput;
    }

    getNormalizedData() {
        if(this.data.length === 0) {
            return [];
        }
        return this.normalizedData;
    }

    getInputCount() {
        if(this.data.length === 0) {
            return 0;
        }
        return this.normalizedData[0].input.length;
    }

    getOutputCount() {
        if(this.data.length === 0) {
            return 0;
        }
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
        console.log('distinct', distinct);
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
                if (distinct.input[i].indexOf(data.input[i].toString()) === -1) {
                    distinct.input[i].push(data.input[i].toString());
                }
            }
        }
        for (let i = 0; i < this.data[0].output.length; i++) {
            distinct.output[i] = [];
            for (let data of this.data) {
                if (distinct.output[i].indexOf(data.output[i].toString()) === -1) {
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