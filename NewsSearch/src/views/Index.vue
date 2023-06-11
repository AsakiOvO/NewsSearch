<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

import User from '@/components/User.vue'
import Word from '@/components/Word.vue'
// 导入改变背景图片的工具类
import { useChangeBgImg } from '@/utils/changeBgImg'
import { showMessage } from '@/utils/message'
import { getToken } from '@/utils/cookie'
import { useTimeFormat } from '@/utils/timeFormat'
import { addHistory } from '@/api/history'
// 导入api
import { getNewsTips } from '@/api/news'
// 导入useRouter
import { useRouter } from 'vue-router'
// 拿到路由实例
const router = useRouter()
const { handleNowTime } = useTimeFormat()

const form = reactive({
    searchKeyWord: ''
});

const {
    backgroundImg,
    IconColor,
    handleChangeBackground,
    resetBackground,
    handleOverChangeBackground,
    handleLeaveChangeBackground
} = useChangeBgImg()

// 重置输入框和背景图片
const handleReset = () => {
    resetBackground()
    form.searchKeyWord = ''
}

// 标志是否已经进行了搜索
let isSearch = false
// 标志用户是否点击新闻提示
let isClickTips = false

// 进行搜索
const handleSearch = async () => {
    if (!form.searchKeyWord) {
        return showMessage('请输入搜索关键词！', 'error')
    }
    // 标志已经进行了搜索，避免消息提示继续请求
    isSearch = true
    // 如果有token 证明用户是在登录情况下进行的搜索
    // 要把用户搜索记录保存到后端
    if (getToken()) {
        const time = handleNowTime()
        const { data: res } = await addHistory({ content: form.searchKeyWord as string, time: time, isTitle: isClickTips })
    }
    router.push({ name: 'result', query: { searchKey: form.searchKeyWord, isTitle: String(isClickTips) }, params: { page: 1, mode: 'correlation' } })
}

// 当输入框获得焦点的时候,显示新闻提示框
const handleInputFocus = () => {
    showTips()
}


// 保存新闻提示
const newsTips = ref<[{ title: string }] | null>(null)

// 控制新闻提示框的显示隐藏
const isShowTpis = ref<boolean>(false)
const showTips = () => {
    if (newsTips.value && newsTips.value.length > 0) {
        isShowTpis.value = true
    }
}
const hideTips = () => {
    isShowTpis.value = false
}

// 当消息提示数据变化时，控制消息提示组件的显示隐藏
watch(newsTips, () => {
    if (!newsTips.value) {
        hideTips()
    } else {
        showTips()
    }
})
// 自定义指令，模拟点击外部隐藏该组件
const vHide = {
    mounted(el: any, binding: any) {
        el.handleClick = (e: Event) => {
            e.stopPropagation()
            const searchInput = document.querySelector('.search-input')
            if (el && searchInput) {
                if (!el.contains(e.target as Node) && !searchInput?.contains(e.target as Node)) {
                    binding.value.fn.apply(this, arguments)
                }
            }
        }
        document.addEventListener('click', el.handleClick)
    },
    beforeUnmount(el: any) {
        document.removeEventListener('click', el.handleClick)
    }
}



// 获取新闻提示
const getTips = async () => {
    // 当输入框不为空字符串时，再进行请求
    if (form.searchKeyWord !== '') {
        const { data: res } = await getNewsTips(form.searchKeyWord)
        if (res.status === 0) {
            newsTips.value = res.data
        }
    }
}

// 定时器 用于防抖
const timer = ref<number | null>()
// 防抖
const handleNewsTips = (fn: Function, time: number) => {
    if (timer.value) {
        clearTimeout(timer.value)
    }
    timer.value = setTimeout(() => {
        // 将原有数据清零,避免无法去除消息提示框的情况
        newsTips.value = null
        fn()
    }, time)
}

// el-input组件定义的防抖函数会失效,只能用侦听器实现
watch(form, () => {
    // 如果没有正在进行搜索，才进行搜索提示
    if (!isSearch) {
        handleNewsTips(getTips, 500)
    }
})

// 用户点击新闻提示处理函数
const handleTipsSelect = (e: any) => {
    form.searchKeyWord = e.target.innerText
    isClickTips = true
    handleSearch()
    // 点击完后，新闻提示隐藏
    hideTips()
}


</script>

<template>
    <div class="index-container" :style="backgroundImg">
        <canvas class="mycanvas" v-show="IconColor !== 'text-gray-500'"></canvas>
        <div class="search-container">
            <!-- 网站TItle -->
            <div class="title-container animate__animated animate__backInDown">
                <img class="title" src="@/assets/NewsSearch.png" alt="在线新闻搜索">
            </div>
            <!-- 搜索框 -->
            <el-form class="animate__animated animate__bounceInLeft" :model="form" @submit.prevent>
                <el-form-item>
                    <el-input class="search-input" v-model.trim="form.searchKeyWord" placeholder="请输入关键词"
                        @keyup.enter="handleSearch" @focus="handleInputFocus" autofocus>
                        <template #prefix>
                            <div class="licon" @click="handleReset"></div>
                        </template>
                        <template #suffix>
                            <el-tooltip effect="light" content="搜索" placement="right" :show-arrow="false" :show-after="300">
                                <el-icon @click="handleSearch" class="ricon">
                                    <Search />
                                </el-icon>
                            </el-tooltip>
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>
            <!-- 搜索提示模块 -->
            <Word v-if="isShowTpis" v-hide="{ fn: hideTips }"
                class="word animate__animated animate__fadeIn animate__faster">
                <template #tips>
                    <ul @click="handleTipsSelect">
                        <li v-for="(item, index) in newsTips" :key="index">
                            <el-icon class="mr-2">
                                <Search />
                            </el-icon>
                            <div>{{ item.title }}</div>
                        </li>
                    </ul>
                </template>
            </Word>
        </div>
        <!-- 切换背景图片 -->
        <div class="change-bg-icon-container animate__animated animate__jackInTheBox"
            @mouseover="handleOverChangeBackground" @mouseleave="handleLeaveChangeBackground"
            @click="handleChangeBackground">
            <el-tooltip effect="light" content="更换背景" placement="left" :show-arrow="false" :show-after="300">
                <img src="../assets/icon/风车1.png" v-if="IconColor === 'text-gray-500'"
                    class="changeBgIcon rotateIcon w-6 h-6" alt="风车">
                <img src="../assets/icon/风车2.png" v-else class="changeBgIcon rotateIcon w-6 h-6" alt="风车">
            </el-tooltip>
        </div>
        <!-- 用户模块 -->
        <User :text-color="IconColor"></User>
    </div>
</template>

<style scoped lang="less">
.index-container {
    @apply h-full relative overflow-hidden;

    .mycanvas {
        @apply m-0 p-0 block;
    }

    .search-container {
        transform: translate(-50%, 0);
        @apply absolute w-2/5 left-2/4 top-1/5;

        // 网站标题
        .title-container {
            width: 100%;
            height: 100px;
            @apply mb-5 overflow-hidden flex items-center justify-center;

            .title {
                @apply max-w-full h-auto block;
            }
        }

        // 搜索
        .search-input {
            font-family: LXGW-XiHei;
            height: 55px;

            // 输入框样式
            :deep(.el-input__wrapper) {
                border-radius: 25px;
                box-shadow: 0 1px 6px 0 gray;
            }

            // 输入框字体样式
            :deep(.el-input__inner) {
                font-size: 18px;
            }

            // placeholder样式
            :deep(.el-input__inner::placeholder) {
                font-size: 18px;
                letter-spacing: 12px;
            }

            :deep(.el-input__prefix) {
                @apply mr-1;
            }

            .licon {
                background: url('@/assets/logo.png') no-repeat center/cover;
                width: 32px;
                height: 32px;
                @apply cursor-pointer overflow-hidden;
            }

            .ricon {
                width: 30px;
                height: 30px;
                font-size: 25px;
                @apply cursor-pointer text-blue-300;
            }
        }

        // 输入框hover样式
        .search-input:hover :deep(.el-input__wrapper) {
            box-shadow: 0 2px 8px 0 gray;
        }

        // 搜索提示组件样式
        .word {
            margin: 0 auto;
            margin-top: -8px;

            li {
                @apply rounded-lg pl-2 h-8 flex items-center text-gray-500;
                line-height: 32px;

                div {
                    width: 100%;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                }
            }

            li:hover {
                @apply cursor-pointer;
                background-color: #e0eee8;
                color: #46cdcf;
            }
        }
    }

    // 更改背景图片图标
    .change-bg-icon-container {
        @apply absolute right-5 bottom-4 cursor-pointer;

        .rotateIcon {
            animation: myrotate 2s linear infinite;
        }
    }
}

// 动画
@keyframes myrotate {
    0% {
        -webkit-transform: rotate(0deg);
    }

    25% {
        -webkit-transform: rotate(90deg);
    }

    50% {
        -webkit-transform: rotate(180deg);
    }

    75% {
        -webkit-transform: rotate(270deg);
    }

    100% {
        -webkit-transform: rotate(360deg);
    }
}
</style>
