<!--
    Component to generate top progress bar
-->

<template>
    <div class="progress-tabs">
        <nav class="navbar navbar-expand navbar-light p-0 justify-content-center">
            <ul class="navbar-nav">
                <li class="nav-item" v-bind:class="{'active': item.active, 'disabled': item.disabled}" v-on:click="setActual(key)" v-for="(item, key) in appFlow">
                    <span class="nav-link">{{item.name}}</span>
                </li>
            </ul>
        </nav>
    </div>
</template>
<script>

    export default {
        name: 'Progress',
        props: ['appFlow'],
        data () {
            return {

            }
        },
        methods: {
            setActual(sectionName){
                if(!this.appFlow[sectionName].disabled || process.env.NODE_ENV === "development"){

                    for(let section in this.appFlow){
                        if (!this.appFlow.hasOwnProperty(section))
                            continue;
                        this.appFlow[section].active = false;
                        this.appFlow[section].disabled = true;
                    }

                    this.appFlow[sectionName].active = true;

                    for(let section in this.appFlow){
                        if (!this.appFlow.hasOwnProperty(section))
                            continue;
                        this.appFlow[section].disabled = false;
                    }
                }
            }
        }
    }
</script>

