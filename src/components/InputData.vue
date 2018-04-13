<template>
    <div>
        <h1>Hi please add data</h1>
        <div>
            <div class="mb">
                <label for="inputs">Input layer</label>
                <input v-model.number="configuration.inputs" id="inputs" type="number"/>
            </div>
            <div class="mb">
                <label for="hidden">Hidden layer</label>
                <input v-model.number="configuration.hidden" id="hidden" type="number"/>
            </div>
            <div class="mb">
                <label for="outputs">Output layer</label>
                <input v-model.number="configuration.outputs" id="outputs" type="number"/>
            </div>
            <div class="mb">
                <label for="iterations">Iterations</label>
                <input v-model.number="configuration.iterations" id="iterations" type="number"/>
            </div>
            <table class="mb">
                <tr v-for="i in data.length">
                    <td v-for="j in configuration.inputs">
                        <input v-model.number="data[i - 1].input[j - 1]" type="number"/>
                    </td>
                    <td> => </td>
                    <td v-for="j in configuration.outputs">
                        <input v-model.number="data[i - 1].output[j - 1]" type="number"/>
                    </td>
                    <td>
                        <button @click="removeData(i - 1)">-</button>
                    </td>
                </tr>
            </table>
            <div class="mb">
                <button @click="addData()">+</button>
            </div>
        </div>
    </div>
</template>

<script>


    export default {
        name: "InputData",
        props: ['configuration', 'data'],
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
        }
    }
</script>