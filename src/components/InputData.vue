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
                    <div class="text-center mb-3">
                        <span class="btn btn-outline-primary btn-sm" @click="loadDummy('and')">And</span>
                        <span class="btn btn-outline-primary btn-sm" @click="loadDummy('or')">Or</span>
                        <span class="btn btn-outline-primary btn-sm" @click="loadDummy('xor')">Xor</span>
                        <span class="btn btn-outline-primary btn-sm" @click="loadDummy('vrtule')">Vrtule</span>
                        <span class="btn btn-outline-primary btn-sm" @click="loadDummy('kruh')">Kruh</span>
                        <span class="btn btn-outline-primary btn-sm" @click="loadDummy('ctverec')">Čtverec</span>
                        <span class="btn btn-outline-primary btn-sm" @click="loadDummy('mnoziny')">Množiny</span>
                    </div>
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
                },
                dummyData: {
                    and: {"configuration":{"inputs":2,"hiddenLayers":[{"count":"1"}],"hopfield":false,"outputs":1,"iterations":1000,"speed":10,"learningRate":0.5,"activationFunction":"LOGISTIC","costFunction":"MSE","minError":0.005},"data":[{"input":[0,0],"output":[0]},{"input":[0,1],"output":[0]},{"input":[1,0],"output":[0]},{"input":[1,1],"output":[1]}],"graphRaw":{"nodes":[{"id":"input-0","label":"Vstup 1","fixed":true,"x":-450,"y":0,"color":"#8cffaa"},{"id":"input-1","label":"Vstup 2","fixed":true,"x":-450,"y":100,"color":"#8cffaa"},{"id":"output-0","label":"Výstup 1","fixed":true,"x":450,"y":0,"color":"#ff5b63"},{"id":"hidden-0-0","label":""}],"edges":[{"from":"input-0","to":"hidden-0-0","id":"42Wbx","arrows":"to"},{"from":"input-1","to":"hidden-0-0","id":"t0JM3","arrows":"to"},{"from":"hidden-0-0","to":"output-0","id":"kPu9n","arrows":"to"}]}},
                    or: {"configuration":{"inputs":2,"hiddenLayers":[{"count":"1"}],"hopfield":false,"outputs":1,"iterations":1000,"speed":10,"learningRate":0.5,"activationFunction":"LOGISTIC","costFunction":"MSE","minError":0.005},"data":[{"input":[0,0],"output":[0]},{"input":[0,1],"output":[1]},{"input":[1,0],"output":[1]},{"input":[1,1],"output":[1]}],"graphRaw":{"nodes":[{"id":"input-0","label":"Vstup 1","fixed":true,"x":-450,"y":0,"color":"#8cffaa"},{"id":"input-1","label":"Vstup 2","fixed":true,"x":-450,"y":100,"color":"#8cffaa"},{"id":"output-0","label":"Výstup 1","fixed":true,"x":450,"y":0,"color":"#ff5b63"},{"id":"hidden-0-0","label":""}],"edges":[{"from":"input-0","to":"hidden-0-0","id":"42Wbx","arrows":"to"},{"from":"input-1","to":"hidden-0-0","id":"t0JM3","arrows":"to"},{"from":"hidden-0-0","to":"output-0","id":"kPu9n","arrows":"to"}]}},
                    xor: {"configuration":{"inputs":2,"hiddenLayers":[{"count":"2"}],"hopfield":false,"outputs":1,"iterations":1000,"speed":10,"learningRate":0.5,"activationFunction":"LOGISTIC","costFunction":"MSE","minError":0.005},"data":[{"input":[0,0],"output":[0]},{"input":[0,1],"output":[1]},{"input":[1,0],"output":[1]},{"input":[1,1],"output":[0]}],"graphRaw":{"nodes":[{"id":"input-0","label":"Vstup 1","fixed":true,"x":-450,"y":0,"color":"#8cffaa"},{"id":"input-1","label":"Vstup 2","fixed":true,"x":-450,"y":100,"color":"#8cffaa"},{"id":"output-0","label":"Výstup 1","fixed":true,"x":450,"y":0,"color":"#ff5b63"},{"id":"hidden-0-0","label":""},{"id":"hidden-0-1","label":""}],"edges":[{"from":"input-0","to":"hidden-0-0","id":"OmNBC","arrows":"to"},{"from":"input-1","to":"hidden-0-0","id":"JozDw","arrows":"to"},{"from":"hidden-0-0","to":"output-0","id":"P8zfE","arrows":"to"},{"from":"input-0","to":"hidden-0-1","id":"LLTaG","arrows":"to"},{"from":"input-1","to":"hidden-0-1","id":"VzQ2S","arrows":"to"},{"from":"hidden-0-1","to":"output-0","id":"1koNC","arrows":"to"}]}},
                    vrtule: {"configuration":{"inputs":2,"hiddenLayers":[{"count":"4"}],"hopfield":false,"outputs":1,"iterations":100000,"speed":10000,"learningRate":0.5,"activationFunction":"LOGISTIC","costFunction":"MSE","minError":0.005},"data":[{"input":[0.050200803212851405,0.9538152610441767],"output":[0]},{"input":[0.05220883534136546,0.8895582329317269],"output":[0]},{"input":[0.03815261044176707,0.8012048192771084],"output":[0]},{"input":[0.04417670682730924,0.7208835341365462],"output":[0]},{"input":[0.04417670682730924,0.6325301204819277],"output":[0]},{"input":[0.04618473895582329,0.5843373493975904],"output":[0]},{"input":[0.6104417670682731,0.40763052208835343],"output":[0]},{"input":[0.6244979919678715,0.3353413654618474],"output":[0]},{"input":[0.6104417670682731,0.25301204819277107],"output":[0]},{"input":[0.6184738955823293,0.13855421686746988],"output":[0]},{"input":[0.6405622489959839,0.060240963855421686],"output":[0]},{"input":[0.7028112449799196,0.04819277108433735],"output":[0]},{"input":[0.7389558232931727,0.16265060240963855],"output":[0]},{"input":[0.7469879518072289,0.26506024096385544],"output":[0]},{"input":[0.7289156626506024,0.35542168674698793],"output":[0]},{"input":[0.8232931726907631,0.36947791164658633],"output":[0]},{"input":[0.8554216867469879,0.3313253012048193],"output":[0]},{"input":[0.8433734939759037,0.22088353413654618],"output":[0]},{"input":[0.8413654618473896,0.13253012048192772],"output":[0]},{"input":[0.9056224899598394,0.3092369477911647],"output":[0]},{"input":[0.9437751004016064,0.26506024096385544],"output":[0]},{"input":[0.9257028112449799,0.0823293172690763],"output":[0]},{"input":[0.8333333333333334,0.03815261044176707],"output":[0]},{"input":[0.929718875502008,0.36947791164658633],"output":[0]},{"input":[0.15261044176706828,0.5943775100401606],"output":[0]},{"input":[0.3273092369477912,0.6204819277108434],"output":[0]},{"input":[0.37349397590361444,0.6526104417670683],"output":[0]},{"input":[0.20481927710843373,0.7168674698795181],"output":[0]},{"input":[0.16265060240963855,0.7369477911646586],"output":[0]},{"input":[0.19076305220883535,0.8333333333333334],"output":[0]},{"input":[0.29116465863453816,0.9156626506024096],"output":[0]},{"input":[0.39558232931726905,0.9156626506024096],"output":[0]},{"input":[0.3493975903614458,0.7670682730923695],"output":[0]},{"input":[0.28714859437751006,0.7650602409638554],"output":[0]},{"input":[0.25502008032128515,0.6124497991967871],"output":[0]},{"input":[0.1686746987951807,0.9417670682730924],"output":[0]},{"input":[0.5742971887550201,0.9337349397590361],"output":[1]},{"input":[0.5803212851405622,0.8493975903614458],"output":[1]},{"input":[0.5622489959839357,0.7168674698795181],"output":[1]},{"input":[0.5582329317269076,0.5783132530120482],"output":[1]},{"input":[0.6485943775100401,0.570281124497992],"output":[1]},{"input":[0.6224899598393574,0.6285140562248996],"output":[1]},{"input":[0.5823293172690763,0.642570281124498],"output":[1]},{"input":[0.7891566265060241,0.6305220883534136],"output":[1]},{"input":[0.8052208835341366,0.572289156626506],"output":[1]},{"input":[0.8815261044176707,0.6867469879518072],"output":[1]},{"input":[0.7349397590361446,0.7449799196787149],"output":[1]},{"input":[0.7208835341365462,0.6385542168674698],"output":[1]},{"input":[0.6586345381526104,0.785140562248996],"output":[1]},{"input":[0.6666666666666666,0.8674698795180723],"output":[1]},{"input":[0.7550200803212851,0.9377510040160643],"output":[1]},{"input":[0.9417670682730924,0.8955823293172691],"output":[1]},{"input":[0.8373493975903614,0.8293172690763052],"output":[1]},{"input":[0.9357429718875502,0.7208835341365462],"output":[1]},{"input":[0.9477911646586346,0.6365461847389559],"output":[1]},{"input":[0.9036144578313253,0.5783132530120482],"output":[1]},{"input":[0.7891566265060241,0.7650602409638554],"output":[1]},{"input":[0.8393574297188755,0.9397590361445783],"output":[1]},{"input":[0.24899598393574296,0.43172690763052207],"output":[1]},{"input":[0.2971887550200803,0.38353413654618473],"output":[1]},{"input":[0.16265060240963855,0.35943775100401604],"output":[1]},{"input":[0.10441767068273092,0.35542168674698793],"output":[1]},{"input":[0.11646586345381527,0.25903614457831325],"output":[1]},{"input":[0.0783132530120482,0.22690763052208834],"output":[1]},{"input":[0.09236947791164658,0.13654618473895583],"output":[1]},{"input":[0.05421686746987952,0.07630522088353414],"output":[1]},{"input":[0.11646586345381527,0.02208835341365462],"output":[1]},{"input":[0.18473895582329317,0.03815261044176707],"output":[1]},{"input":[0.18072289156626506,0.15060240963855423],"output":[1]},{"input":[0.26907630522088355,0.20481927710843373],"output":[1]},{"input":[0.285140562248996,0.178714859437751],"output":[1]},{"input":[0.321285140562249,0.05823293172690763],"output":[1]},{"input":[0.26506024096385544,0.040160642570281124],"output":[1]},{"input":[0.42570281124497994,0.10843373493975904],"output":[1]},{"input":[0.4538152610441767,0.018072289156626505],"output":[1]},{"input":[0.357429718875502,0.17670682730923695],"output":[1]},{"input":[0.2971887550200803,0.23694779116465864],"output":[1]},{"input":[0.20682730923694778,0.26305220883534136],"output":[1]},{"input":[0.3453815261044177,0.26506024096385544],"output":[1]},{"input":[0.39558232931726905,0.3614457831325301],"output":[1]},{"input":[0.37349397590361444,0.41767068273092367],"output":[1]},{"input":[0.43172690763052207,0.37751004016064255],"output":[1]},{"input":[0.44176706827309237,0.23293172690763053],"output":[1]},{"input":[0.4397590361445783,0.29518072289156627],"output":[1]},{"input":[0.42570281124497994,0.19879518072289157],"output":[1]},{"input":[0.060240963855421686,0.3092369477911647],"output":[1]},{"input":[0.05421686746987952,0.39959839357429716],"output":[1]},{"input":[0.26706827309236947,0.3413654618473896],"output":[1]}],"graphRaw":{"nodes":[{"id":"input-0","label":"Vstup 1","fixed":true,"x":-450,"y":0,"color":"#8cffaa"},{"id":"input-1","label":"Vstup 2","fixed":true,"x":-450,"y":100,"color":"#8cffaa"},{"id":"output-0","label":"Výstup 1","fixed":true,"x":450,"y":0,"color":"#ff5b63"},{"id":"hidden-0-0","label":""},{"id":"hidden-0-1","label":""},{"id":"hidden-0-2","label":""},{"id":"hidden-0-3","label":""}],"edges":[{"from":"input-0","to":"hidden-0-0","id":"5gOz4","arrows":"to"},{"from":"input-1","to":"hidden-0-0","id":"JNbTv","arrows":"to"},{"from":"hidden-0-0","to":"output-0","id":"bRw1R","arrows":"to"},{"from":"input-0","to":"hidden-0-1","id":"xvxN7","arrows":"to"},{"from":"input-1","to":"hidden-0-1","id":"F5g3N","arrows":"to"},{"from":"hidden-0-1","to":"output-0","id":"SOEQf","arrows":"to"},{"from":"input-0","to":"hidden-0-2","id":"V8MJ8","arrows":"to"},{"from":"input-1","to":"hidden-0-2","id":"iMdsY","arrows":"to"},{"from":"hidden-0-2","to":"output-0","id":"z78mH","arrows":"to"},{"from":"input-0","to":"hidden-0-3","id":"luolT","arrows":"to"},{"from":"input-1","to":"hidden-0-3","id":"IATih","arrows":"to"},{"from":"hidden-0-3","to":"output-0","id":"P1fLk","arrows":"to"}]}},
                    kruh: {"configuration":{"inputs":2,"hiddenLayers":[{"count":3}],"hopfield":false,"outputs":1,"iterations":1000,"speed":10,"learningRate":0.5,"activationFunction":"LOGISTIC","costFunction":"MSE","minError":0.005},"data":[{"input":[0.44377510040160645,0.6024096385542169],"output":[0]},{"input":[0.38755020080321284,0.536144578313253],"output":[0]},{"input":[0.36947791164658633,0.43172690763052207],"output":[0]},{"input":[0.4397590361445783,0.3534136546184739],"output":[0]},{"input":[0.5823293172690763,0.35542168674698793],"output":[0]},{"input":[0.6445783132530121,0.42369477911646586],"output":[0]},{"input":[0.6104417670682731,0.572289156626506],"output":[0]},{"input":[0.4799196787148594,0.6365461847389559],"output":[0]},{"input":[0.3534136546184739,0.5461847389558233],"output":[0]},{"input":[0.4397590361445783,0.39759036144578314],"output":[0]},{"input":[0.4959839357429719,0.5180722891566265],"output":[0]},{"input":[0.5401606425702812,0.5562248995983936],"output":[0]},{"input":[0.5020080321285141,0.4457831325301205],"output":[0]},{"input":[0.5,0.3714859437751004],"output":[0]},{"input":[0.6244979919678715,0.5060240963855421],"output":[0]},{"input":[0.5622489959839357,0.6285140562248996],"output":[0]},{"input":[0.44377510040160645,0.5401606425702812],"output":[0]},{"input":[0.41967871485943775,0.45180722891566266],"output":[0]},{"input":[0.3393574297188755,0.8152610441767069],"output":[1]},{"input":[0.23092369477911648,0.7469879518072289],"output":[1]},{"input":[0.15461847389558234,0.6506024096385542],"output":[1]},{"input":[0.18072289156626506,0.46987951807228917],"output":[1]},{"input":[0.1686746987951807,0.2931726907630522],"output":[1]},{"input":[0.178714859437751,0.19678714859437751],"output":[1]},{"input":[0.3674698795180723,0.08835341365461848],"output":[1]},{"input":[0.606425702811245,0.09839357429718876],"output":[1]},{"input":[0.7088353413654619,0.19477911646586346],"output":[1]},{"input":[0.6666666666666666,0.2289156626506024],"output":[1]},{"input":[0.8714859437751004,0.3313253012048193],"output":[1]},{"input":[0.7911646586345381,0.5622489959839357],"output":[1]},{"input":[0.7610441767068273,0.7188755020080321],"output":[1]},{"input":[0.678714859437751,0.8072289156626506],"output":[1]},{"input":[0.42570281124497994,0.7811244979919679],"output":[1]},{"input":[0.28112449799196787,0.7168674698795181],"output":[1]},{"input":[0.2289156626506024,0.570281124497992],"output":[1]},{"input":[0.27710843373493976,0.3714859437751004],"output":[1]},{"input":[0.41967871485943775,0.20281124497991967],"output":[1]},{"input":[0.5883534136546185,0.22289156626506024],"output":[1]},{"input":[0.7570281124497992,0.3614457831325301],"output":[1]},{"input":[0.7409638554216867,0.463855421686747],"output":[1]},{"input":[0.8654618473895582,0.5441767068273092],"output":[1]},{"input":[0.8975903614457831,0.7248995983935743],"output":[1]},{"input":[0.8995983935742972,0.8995983935742972],"output":[1]},{"input":[0.7891566265060241,0.9698795180722891],"output":[1]},{"input":[0.41365461847389556,0.9337349397590361],"output":[1]},{"input":[0.11044176706827309,0.8775100401606426],"output":[1]},{"input":[0.05823293172690763,0.8493975903614458],"output":[1]},{"input":[0.09036144578313253,0.5060240963855421],"output":[1]},{"input":[0.10642570281124498,0.3654618473895582],"output":[1]},{"input":[0.10040160642570281,0.1927710843373494],"output":[1]},{"input":[0.23293172690763053,0.11244979919678715],"output":[1]},{"input":[0.8012048192771084,0.12449799196787148],"output":[1]},{"input":[0.927710843373494,0.2710843373493976],"output":[1]},{"input":[0.6044176706827309,0.9457831325301205],"output":[1]}],"graphRaw":{"nodes":[{"id":"input-0","label":"Vstup 1","fixed":true,"x":-450,"y":0,"color":"#8cffaa"},{"id":"input-1","label":"Vstup 2","fixed":true,"x":-450,"y":100,"color":"#8cffaa"},{"id":"output-0","label":"Výstup 1","fixed":true,"x":450,"y":0,"color":"#ff5b63"},{"id":"hidden-0-0","label":""},{"id":"hidden-0-1","label":""},{"id":"hidden-0-2","label":""}],"edges":[{"from":"input-0","to":"hidden-0-0","id":"V0JPG","arrows":"to"},{"from":"input-1","to":"hidden-0-0","id":"8ep62","arrows":"to"},{"from":"hidden-0-0","to":"output-0","id":"RFDnJ","arrows":"to"},{"from":"input-0","to":"hidden-0-1","id":"bemQx","arrows":"to"},{"from":"input-1","to":"hidden-0-1","id":"N7ctq","arrows":"to"},{"from":"hidden-0-1","to":"output-0","id":"M1z4b","arrows":"to"},{"from":"input-0","to":"hidden-0-2","id":"iIcB2","arrows":"to"},{"from":"input-1","to":"hidden-0-2","id":"VE9SC","arrows":"to"},{"from":"hidden-0-2","to":"output-0","id":"VtCqe","arrows":"to"}]}},
                    ctverec: {"configuration":{"inputs":2,"hiddenLayers":[{"count":"4"}],"hopfield":false,"outputs":1,"iterations":1000,"speed":10,"learningRate":0.5,"activationFunction":"LOGISTIC","costFunction":"MSE","minError":0.005},"data":[{"input":[0.28313253012048195,0.6927710843373494],"output":[0]},{"input":[0.28313253012048195,0.5662650602409639],"output":[0]},{"input":[0.28112449799196787,0.4799196787148594],"output":[0]},{"input":[0.27710843373493976,0.3654618473895582],"output":[0]},{"input":[0.40763052208835343,0.3132530120481928],"output":[0]},{"input":[0.5401606425702812,0.3273092369477912],"output":[0]},{"input":[0.6606425702811245,0.3192771084337349],"output":[0]},{"input":[0.7048192771084337,0.3273092369477912],"output":[0]},{"input":[0.7048192771084337,0.4538152610441767],"output":[0]},{"input":[0.7048192771084337,0.5481927710843374],"output":[0]},{"input":[0.7208835341365462,0.6285140562248996],"output":[0]},{"input":[0.5281124497991968,0.6405622489959839],"output":[0]},{"input":[0.3815261044176707,0.6706827309236948],"output":[0]},{"input":[0.4859437751004016,0.6666666666666666],"output":[0]},{"input":[0.6506024096385542,0.6746987951807228],"output":[0]},{"input":[0.7570281124497992,0.6827309236947792],"output":[0]},{"input":[0.42168674698795183,0.5542168674698795],"output":[0]},{"input":[0.3855421686746988,0.41566265060240964],"output":[0]},{"input":[0.5180722891566265,0.42771084337349397],"output":[0]},{"input":[0.5803212851405622,0.5441767068273092],"output":[0]},{"input":[0.642570281124498,0.5783132530120482],"output":[0]},{"input":[0.6244979919678715,0.42771084337349397],"output":[0]},{"input":[0.5983935742971888,0.40160642570281124],"output":[0]},{"input":[0.10441767068273092,0.9036144578313253],"output":[1]},{"input":[0.07028112449799197,0.6546184738955824],"output":[1]},{"input":[0.08835341365461848,0.4497991967871486],"output":[1]},{"input":[0.1144578313253012,0.3192771084337349],"output":[1]},{"input":[0.09437751004016064,0.142570281124498],"output":[1]},{"input":[0.13052208835341367,0.060240963855421686],"output":[1]},{"input":[0.43373493975903615,0.060240963855421686],"output":[1]},{"input":[0.3855421686746988,0.15461847389558234],"output":[1]},{"input":[0.25100401606425704,0.10843373493975904],"output":[1]},{"input":[0.6907630522088354,0.0783132530120482],"output":[1]},{"input":[0.7188755020080321,0.15060240963855423],"output":[1]},{"input":[0.7530120481927711,0.16265060240963855],"output":[1]},{"input":[0.9176706827309237,0.14056224899598393],"output":[1]},{"input":[0.8614457831325302,0.4598393574297189],"output":[1]},{"input":[0.8534136546184738,0.39156626506024095],"output":[1]},{"input":[0.8534136546184738,0.3393574297188755],"output":[1]},{"input":[0.8493975903614458,0.6325301204819277],"output":[1]},{"input":[0.8534136546184738,0.8012048192771084],"output":[1]},{"input":[0.6164658634538153,0.8714859437751004],"output":[1]},{"input":[0.3092369477911647,0.8433734939759037],"output":[1]},{"input":[0.17670682730923695,0.8453815261044176],"output":[1]},{"input":[0.20883534136546184,0.6927710843373494],"output":[1]},{"input":[0.15261044176706828,0.4759036144578313],"output":[1]},{"input":[0.41365461847389556,0.7710843373493976],"output":[1]},{"input":[0.6485943775100401,0.8453815261044176],"output":[1]},{"input":[0.5783132530120482,0.9337349397590361],"output":[1]},{"input":[0.8975903614457831,0.9116465863453815],"output":[1]},{"input":[0.9317269076305221,0.8313253012048193],"output":[1]},{"input":[0.5080321285140562,0.8253012048192772],"output":[1]},{"input":[0.3815261044176707,0.9317269076305221],"output":[1]},{"input":[0.6144578313253012,0.8493975903614458],"output":[1]},{"input":[0.7951807228915663,0.748995983935743],"output":[1]},{"input":[0.9457831325301205,0.45582329317269077],"output":[1]},{"input":[0.5763052208835341,0.12048192771084337],"output":[1]},{"input":[0.27309236947791166,0.1746987951807229],"output":[1]}],"graphRaw":{"nodes":[{"id":"input-0","label":"Vstup 1","fixed":true,"x":-450,"y":0,"color":"#8cffaa"},{"id":"input-1","label":"Vstup 2","fixed":true,"x":-450,"y":100,"color":"#8cffaa"},{"id":"output-0","label":"Výstup 1","fixed":true,"x":450,"y":0,"color":"#ff5b63"},{"id":"hidden-0-0","label":""},{"id":"hidden-0-1","label":""},{"id":"hidden-0-2","label":""},{"id":"hidden-0-3","label":""}],"edges":[{"from":"input-0","to":"hidden-0-0","id":"NaOJg","arrows":"to"},{"from":"input-1","to":"hidden-0-0","id":"83Pmu","arrows":"to"},{"from":"hidden-0-0","to":"output-0","id":"rwJGJ","arrows":"to"},{"from":"input-0","to":"hidden-0-1","id":"XK4re","arrows":"to"},{"from":"input-1","to":"hidden-0-1","id":"czBw7","arrows":"to"},{"from":"hidden-0-1","to":"output-0","id":"yynht","arrows":"to"},{"from":"input-0","to":"hidden-0-2","id":"0b9Oi","arrows":"to"},{"from":"input-1","to":"hidden-0-2","id":"Bh6aJ","arrows":"to"},{"from":"hidden-0-2","to":"output-0","id":"bHr4E","arrows":"to"},{"from":"input-0","to":"hidden-0-3","id":"DEqI5","arrows":"to"},{"from":"input-1","to":"hidden-0-3","id":"YgezW","arrows":"to"},{"from":"hidden-0-3","to":"output-0","id":"DkSh9","arrows":"to"}]}},
                    mnoziny: {"configuration":{"inputs":2,"hiddenLayers":[{"count":"1"}],"hopfield":false,"outputs":1,"iterations":1000,"speed":10,"learningRate":0.5,"activationFunction":"LOGISTIC","costFunction":"MSE","minError":0.005},"data":[{"input":[0.1285140562248996,0.9136546184738956],"output":[0]},{"input":[0.07429718875502007,0.8373493975903614],"output":[0]},{"input":[0.16265060240963855,0.7088353413654619],"output":[0]},{"input":[0.28714859437751006,0.8614457831325302],"output":[0]},{"input":[0.25903614457831325,0.8313253012048193],"output":[0]},{"input":[0.15863453815261044,0.6506024096385542],"output":[0]},{"input":[0.13453815261044177,0.7289156626506024],"output":[0]},{"input":[0.3092369477911647,0.893574297188755],"output":[0]},{"input":[0.1646586345381526,0.8855421686746988],"output":[0]},{"input":[0.22690763052208834,0.7891566265060241],"output":[0]},{"input":[0.15461847389558234,0.7570281124497992],"output":[0]},{"input":[0.35943775100401604,0.6144578313253012],"output":[0]},{"input":[0.1706827309236948,0.6224899598393574],"output":[0]},{"input":[0.12248995983935743,0.6244979919678715],"output":[0]},{"input":[0.11847389558232932,0.6686746987951807],"output":[0]},{"input":[0.3714859437751004,0.7469879518072289],"output":[0]},{"input":[0.39558232931726905,0.7710843373493976],"output":[0]},{"input":[0.2710843373493976,0.6927710843373494],"output":[0]},{"input":[0.2991967871485944,0.7309236947791165],"output":[0]},{"input":[0.3112449799196787,0.7771084337349398],"output":[0]},{"input":[0.2289156626506024,0.6847389558232931],"output":[0]},{"input":[0.178714859437751,0.7951807228915663],"output":[0]},{"input":[0.7530120481927711,0.3493975903614458],"output":[1]},{"input":[0.6947791164658634,0.3192771084337349],"output":[1]},{"input":[0.5943775100401606,0.17269076305220885],"output":[1]},{"input":[0.6726907630522089,0.0783132530120482],"output":[1]},{"input":[0.7570281124497992,0.13855421686746988],"output":[1]},{"input":[0.7108433734939759,0.21285140562248997],"output":[1]},{"input":[0.8734939759036144,0.17269076305220885],"output":[1]},{"input":[0.8514056224899599,0.02208835341365462],"output":[1]},{"input":[0.7530120481927711,0.09036144578313253],"output":[1]},{"input":[0.8353413654618473,0.21084337349397592],"output":[1]},{"input":[0.8152610441767069,0.25903614457831325],"output":[1]},{"input":[0.7791164658634538,0.2971887550200803],"output":[1]},{"input":[0.6244979919678715,0.26907630522088355],"output":[1]},{"input":[0.6244979919678715,0.10642570281124498],"output":[1]},{"input":[0.8433734939759037,0.09839357429718876],"output":[1]},{"input":[0.8775100401606426,0.3453815261044177],"output":[1]},{"input":[0.8955823293172691,0.2710843373493976],"output":[1]},{"input":[0.8072289156626506,0.3333333333333333],"output":[1]},{"input":[0.7811244979919679,0.05421686746987952],"output":[1]}],"graphRaw":{"nodes":[{"id":"input-0","label":"Vstup 1","fixed":true,"x":-450,"y":0,"color":"#8cffaa"},{"id":"input-1","label":"Vstup 2","fixed":true,"x":-450,"y":100,"color":"#8cffaa"},{"id":"output-0","label":"Výstup 1","fixed":true,"x":450,"y":0,"color":"#ff5b63"},{"id":"hidden-0-0","label":""}],"edges":[{"from":"input-0","to":"hidden-0-0","id":"pyLXl","arrows":"to"},{"from":"input-1","to":"hidden-0-0","id":"5ROLO","arrows":"to"},{"from":"hidden-0-0","to":"output-0","id":"Ccitr","arrows":"to"}]}},
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
            loadDummy(type){
                this.$emit('load-dummy', this.dummyData[type])
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