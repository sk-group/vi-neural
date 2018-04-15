<template>
    <div id="index">
        <div class="text-center my-5">
            <h1>Oh, Hi Mark!</h1>
            <router-link class="btn btn-lg btn-primary" :to="{ name: 'Network'}">
                Neuronová síť
            </router-link>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'Index',

    }
</script>

<style lang="scss">

</style>
