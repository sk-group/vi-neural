<template>
    <div>
        <h1>Nice result</h1>
        <div v-if="configuration.inputs == 2">
            <canvas width="200" height="200" ref="canvas"></canvas>
        </div>
        <div v-else v-for="result in results">
            <table>
                <tr>
                    <td v-for="j in result.input.length" style="width: 10px">
                        {{ result.input[j - 1] }}
                    </td>
                    <td> => </td>
                    <td v-for="j in result.output.length" style="width: 500px">
                        {{ result.output[j - 1] }}
                    </td>
                </tr>
            </table>
        </div>
        <p>Iteration: {{ iteration }}</p>
        <h1>Test the network</h1>
        <div>
            <table>
                <td v-for="j in configuration.inputs">
                    <input v-model.number="testData[j - 1]" type="number"/>
                </td>
                <td> => </td>
                <td>{{ testResult }}</td>
            </table>
        </div>
        <button @click="test()">Test</button>
    </div>
</template>

<script>


    export default {
        name: "Result",
        props: ['configuration', 'perceptron', 'testData', 'iteration'],
        data(){
            return{
                testResult: null,
            }
        },
        methods:{

            test() {
                this.testResult = this.perceptron.activate(this.testData)
            }
        }
    }
</script>