<template>
    <div>
        <h1>Design network</h1>
        <div class="mb">
            <button @click="$emit('start-learn')">Learn</button>
        </div>
    </div>
</template>

<script>


    export default {
        name: "NetworkDesign",
        props: ['configuration']
    }
</script>