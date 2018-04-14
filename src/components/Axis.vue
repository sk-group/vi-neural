<template>
    <div class="axis" v-bind:class="{
    vertical: this.vertical,
    bottom: this.bottom}" ref="axis">
        <span class="line"></span>
        <span class="label zero">0</span>
        <span class="rule" v-for="rule in rules" :style="{
            top: rule.top,
            left: rule.left}" />
        <span class="label one">1</span>
    </div>
</template>

<script>
    export default {
        props: ['vertical', 'size', 'bottom'],
        mounted() {
            let axis = this.$refs.axis;
            if (this.vertical) {
                axis.style.height = axis.parentElement.clientHeight + 'px';
            } else {
                axis.style.width = axis.parentElement.clientWidth + 'px';
            }
            // create rules
            let rulesCount = 10;
            for (let i = 0; i <= rulesCount; i++) {
                if (this.vertical) {
                    this.rules.push({
                        top: (((axis.parentElement.clientHeight - 40) / rulesCount) * i + 20) + 'px',
                        left: '5px'
                    });
                } else {
                    this.rules.push({
                        top: '5px',
                        left: (((axis.parentElement.clientWidth - 40) / rulesCount) * i + 20) + 'px'
                    });
                }
            }
        },
        data() {
            return {
                rules: []
            }
        }
    }
</script>

<style scoped lang="scss">
    .axis {
        z-index: 2;
        position: absolute;
        width: 20px;
        height: 20px;
        top: 0;
        left: 0;

        .line {
            width: calc(100% - 10px);
            height: 1px;
            position: absolute;
            top: 10px;
            left: 5px;
            background: black;
        }

        .rule {
            position: absolute;
            background: black;
            height: 10px;
            width: 1px;
        }

        .label {
            display: inline-block;
            width: 20px;
            line-height: 20px;
            position: absolute;
            text-align: center;
            vertical-align: middle;
            bottom: 20px;

            &.zero {
                left: 10px;
            }

            &.one {
                right: 10px;
            }
        }

        &.bottom {
            right: 0;
            bottom: 0;
            top: auto;
            left: auto;

            .label {
                top: 20px;
                bottom: auto;
            }
        }

        &.vertical {
            .line {
                width: 1px;
                height: calc(100% - 10px);
                top: 5px;
                left: 9px;
            }

            .rule {
                width: 10px;
                height: 1px;
            }

            .label {
                right: 20px;
                left: auto;

                &.zero {
                    top: auto;
                    bottom: 10px;
                }

                &.one {
                    top: 10px;
                    bottom: auto;
                }
            }

            &.bottom {
                .label {
                    left: 20px;
                    right: auto;
                }
            }
        }
    }
</style>