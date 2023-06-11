<script setup lang="ts">
import { ref, computed } from 'vue'

const dialogVisible = ref(false)
const loading = ref(false)
const props = defineProps({
    title: {
        type: String,
        default: '默认标题'
    },
    width: {
        type: String,
        default: '30%'
    },
    confirmText: {
        type: String,
        default: '确认'
    },
    destoryOnClose: {
        type: Boolean,
        default: true
    }
})

const emits = defineEmits(['confirm', 'closed'])

const showDialog = () => {
    dialogVisible.value = true
}

const hideDialog = () => {
    dialogVisible.value = false
}

const showLoading = () => {
    loading.value = true
}

const hideLoading = () => {
    loading.value = false
}

const handleConfirm = () => {
    emits('confirm')
}

const handleClosed = () => {
    emits('closed')
}

defineExpose({
    showDialog,
    hideDialog,
    showLoading,
    hideLoading
})


</script>

<template>
    <div>
        <el-dialog v-model="dialogVisible" :width="width" :destroy-on-close="destoryOnClose" :close-on-click-modal="true"
            @closed="handleClosed" :show-close="false" :align-center="true">
            <template #header>
                <div :class="title.length === 2 ? 'header-1' : 'header-2'">
                    {{ title }}
                </div>
            </template>
            <slot name="content"></slot>
            <template #footer>
                <span class="w-50/100 h-[50px] mb-6">
                    <el-button class="confirmBtn" type="primary" @click="handleConfirm" :loading="loading">
                        <span class="mr-[-1px] tracking-1px">{{ confirmText }}</span>
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<style scoped lang="less">
// 毛玻璃效果
:deep(.el-overlay) {
    backdrop-filter: saturate(97%) blur(41px);
}

:deep(.el-dialog__header) {
    margin-right: 0;
}

// 标题样式
.header-1 {
    margin-right: -2em;
    @apply flex justify-center items-center text-4xl text-shadow-sm tracking-2em;
}

.header-2 {
    margin-right: -12px;
    letter-spacing: 12px;
    @apply flex justify-center items-center text-4xl text-shadow-sm;
}

// 弹窗整体样式
:deep(.el-dialog) {
    // background: url('src/assets/dialog-bg.png') no-repeat center/cover;
    background: #ece9e6;
    /* fallback for old browsers */
    background: -webkit-linear-gradient(to right, rgb(236, 233, 230), rgb(255, 255, 255));
    /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to right, rgb(236, 233, 230), rgb(255, 255, 255));
    /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
    @apply pt-10 pb-8 rounded-md;
}

:deep(.el-dialog__body) {
    @apply pb-4;
}

// 确认按钮样式
:deep(.el-dialog__footer) {
    height: auto;
    @apply flex justify-center items-center pb-6 pt-0;
}

.confirmBtn {
    background: #c3bef0;
    font-family: LXGW-XiHei;
    color: #f0fcff;
    @apply w-full h-full text-xl border-none shadow-sm shadow-gray-400;
    transition: 0.2s ease;
}

.confirmBtn:hover {
    background: #cadefc;
}

.confirmBtn:focus {
    background: #cadefc;
}

.confirmBtn:active {
    background: #cca8e9;
    border: 2px solid #b7b2a9;
    @apply shadow-none;
}
</style>
