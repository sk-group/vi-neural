<template>
    <div id="app">
        <div class="main">
            <router-view />
        </div>
        <div class="text-center footer">
            <p>
                &copy; {{ year }} sk-group <a class="github-button" href="https://github.com/sk-group/vi-neural" aria-label="Star sk-group/vi-neural on GitHub">Star</a>
            </p>
        </div>
    </div>
</template>

<script>
    /**
     * Main component of this application, contains router view
     */
    export default {
        name: 'App',
        data() {
            return {
                year: new Date().getFullYear()
            }
        }
    }
</script>

<style lang="scss">
    $border-radius: 0;
    $border-radius-lg: 0;
    $border-radius-sm: 0;
    @import '../node_modules/bootstrap/scss/bootstrap';

    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        color: #2c3e50;
        display: flex;
        min-height: 100vh;
        flex-direction: column;
    }

    .main {
        flex: 1;
        text-align: center;
    }

    .footer {
        background: #eee;
        padding: 15px;

        p {
            margin-bottom: 0;
        }
    }
</style>
