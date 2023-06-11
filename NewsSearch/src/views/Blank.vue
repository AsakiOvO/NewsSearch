<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

router.push({ name: 'result', query: { searchKey: route.query.searchKey, isTitle: route.query.isTitle }, params: { page: route.params.page, mode: route.params.mode } })

</script>

<template>
    <div></div>
</template>

<style lang="less" scoped></style>