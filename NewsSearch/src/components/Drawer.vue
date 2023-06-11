<script lang="ts" setup>
import { ref } from 'vue'
const drawerVisible = ref(false)
const showDrawer = () => {
    drawerVisible.value = true
}
const hideDrawer = () => {
    drawerVisible.value = false
}

const props = defineProps({
    title: {
        type: String,
        default: '默认标题'
    },
    closeOnClickModal: {
        type: Boolean,
        default: true
    },
    destoryOnClose: {
        type: Boolean,
        default: false
    },
    size: {
        type: String,
        default: '30%'
    }

})

defineExpose({
    showDrawer,
    hideDrawer
})

</script>

<template>
    <div>
        <el-drawer class="opacity-85 rounded-2xl !w-[25%] ml-auto mr-7 mt-7" v-model="drawerVisible"
            :close-on-click-modal="closeOnClickModal" :destory-on-close="destoryOnClose" direction="ttb" :size="size"
            :show-close="false">
            <template #header>
                <div class="drawerHeader">
                    {{ title }}
                </div>
            </template>
            <slot name="content"></slot>
        </el-drawer>
    </div>
</template>

<style scoped lang="less">
// 抽屉组件头部样式
:deep(.el-drawer__header) {
    @apply mb-2;
}

:deep(.el-drawer) {
    background: #ece9e6;
    /* fallback for old browsers */
    background: -webkit-linear-gradient(to right, rgb(236, 233, 230), rgb(255, 255, 255));
    /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to right, rgb(236, 233, 230), rgb(255, 255, 255));
    /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

// 抽屉组件标题样式
.drawerHeader {
    font-family: SmileySans;
    @apply text-xl tracking-wide text-cyan-400;
}

// ×按钮样式
:deep(.el-icon svg) {
    @apply text-cyan-500;
}

// 毛玻璃效果
:deep(.el-overlay) {
    backdrop-filter: saturate(97%) blur(12px);
}
</style>