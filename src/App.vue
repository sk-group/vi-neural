<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script>

    export default {
        name: 'App',
    }
</script>

<style lang="scss">
    $border-radius: 0;
    $border-radius-lg: 0;
    $border-radius-sm: 0;
    @import '../node_modules/bootstrap/scss/bootstrap';
</style>
