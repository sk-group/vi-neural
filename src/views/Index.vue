<template>
    <div id="index">
        <div class="main container">
            <div>
                <h1 class="my-5 title">vi-neural</h1>
                <p>Vytvořte si vlastní neuronovou síť.</p>
                <router-link class="btn btn-xlg btn-success" :to="{ name: 'Network'}">
                    Vyzkoušet
                </router-link>
            </div>
            <h1 class="my-5">Poháněno pomocí</h1>
            <div class="row">
                <div class="col-md-3">
                    <a href="http://caza.la/synaptic/" class="powered-by synapticjs" target="_blank">
                        <h3>synaptic.js</h3>
                    </a>
                </div>
                <div class="col-md-3">
                    <a href="http://vuejs.org/" class="powered-by vuejs" target="_blank">
                        <h3>Vue.js</h3>
                    </a>
                </div>
                <div class="col-md-3">
                    <a href="http://visjs.org/" class="powered-by visjs" target="_blank">
                        <h3>vis.js</h3>
                    </a>
                </div>
                <div class="col-md-3">
                    <a href="http://getbootstrap.com/" class="powered-by bootstrap" target="_blank">
                        <h3>Bootstrap</h3>
                    </a>
                </div>
            </div>
        </div>
        <div class="text-center footer">
            <p>
                &copy; {{ year }} sk-group <a class="github-button" href="https://github.com/sk-group/vi-neural" aria-label="Star sk-group/vi-neural on GitHub">Star</a>
            </p>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Index',
        data() {
            return {
                year: new Date().getFullYear()
            }
        }
    }
</script>

<style lang="scss">
    .title {
        font-size: 4rem;
    }

    .btn-xlg {
        font-size: 3rem;
        padding: 1rem 2rem;
    }

    #index {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        display: flex;
        min-height: 100vh;
        flex-direction: column;
        color: #2c3e50;
    }

    .main {
        flex: 1;
        text-align: center;

        .powered-by {
            position: relative;
            display: block;
            height: 300px;
            background-color: #eee;
            background-position: center center;
            background-repeat: no-repeat;
            color: inherit;

            &:hover {
                background-color: #ddd;
            }

            &.synapticjs {
                background-image: url(../assets/synapticjs.png);
            }

            &.vuejs {
                background-image: url(../assets/vuejs.png);
            }

            &.visjs {
                background-image: url(../assets/visjs.png);
            }

            &.bootstrap {
                background-image: url(../assets/bootstrap.png);
            }

            h3 {
                position: absolute;
                bottom: 0;
                width: 100%;
            }
        }
    }

    .footer {
        background: #eee;
        padding: 15px;

        p {
            margin-bottom: 0;
        }
    }
</style>
