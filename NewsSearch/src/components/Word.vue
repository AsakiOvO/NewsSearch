<script lang="ts" setup>
</script>

<template>
    <div class="word-container">
        <slot name="tips"></slot>
    </div>
</template>

<style lang="less" scoped>
.word-container {
    @apply w-95/100 h-auto p-3 rounded-lg border-none;
    box-shadow: 0 1px 3px 1px rgb(32 33 36 / 14%);
    background: #f0fcff;
}
</style>