<!--
    Component to generate top progress bar
-->

<template>
    <div class="container mb-5">
        <nav>
            <ul class="nav nav-pills nav-fill">
                <li
                        class="nav-item"
                        @click="setActual(key)"
                        v-for="(item, key) in appFlow"
                >
                    <span
                            class="nav-link"
                            :class="{'active': item.active, 'disabled': item.disabled, 'cursor-pointer': !item.disabled}"
                    >{{item.name}}</span>
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

                    let findActive = false;
                    for(let section in this.appFlow){
                        if (!this.appFlow.hasOwnProperty(section))
                            continue;

                        if(!findActive){
                            this.appFlow[section].disabled = false;
                        }

                        if(this.appFlow[section].active){
                            findActive = true;
                        }
                    }
                }
            }
        }
    }
</script>

