<template>
    <div id="app">
        <Network />
    </div>
</template>

<script>
    import HelloWorld from './components/HelloWorld';
    import Network from './components/Network';

    export default {
        name: 'App',
        components: {
            HelloWorld,
            Network
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }

    table {
        margin: 0 auto;
        text-align: left;
    }

    .mb {
        margin-bottom: 5px;
    }
</style>
