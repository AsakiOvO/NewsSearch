<script lang="ts" setup>
import { computed, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showMessage } from '@/utils/message'
import { getToken } from '@/utils/cookie'
import { useTimeFormat } from '@/utils/timeFormat'
import { addHistory } from '@/api/history'
import User from '@/components/User.vue'
// 导入pinia
import { useNewsStore } from '@/stores/news'
// 按需引入折线图
import * as echarts from 'echarts/core';
import {
    BarChart,
    // 系列类型的定义后缀都为 SeriesOption
    type BarSeriesOption,
    LineChart,
    type LineSeriesOption
} from 'echarts/charts'
import {
    TitleComponent,
    // 组件类型的定义后缀都为 ComponentOption
    type TitleComponentOption,
    TooltipComponent,
    type TooltipComponentOption,
    GridComponent,
    type GridComponentOption,
    // 数据集组件
    DatasetComponent,
    type DatasetComponentOption,
    // 内置数据转换器组件 (filter, sort)
    TransformComponent
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必须的组件
echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    BarChart,
    LineChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
])

const route = useRoute()
const router = useRouter()
const newsStore = useNewsStore()

const { handleTimeFormat, handleNowTime } = useTimeFormat()

const form = reactive({
    searchKeyWord: route.query.searchKey
})

const newsList = computed(() => {
    const list = newsStore.newsList.map(item => {
        const temp = { ...item }
        temp.time = handleTimeFormat(item.time)
        return temp
    })
    return list
})


// 输入框确认事件
const handleSearch = async () => {
    if (!form.searchKeyWord) {
        return showMessage('请输入搜索关键词！', 'error')
    }
    // 如果有token 证明用户是在登录情况下进行的搜索
    // 要把用户搜索记录保存到后端
    if (getToken()) {
        const time = handleNowTime()
        const { data: res } = await addHistory({ content: form.searchKeyWord as string, time: time, isTitle: false })
    }
    router.push({ name: 'result', query: { searchKey: form.searchKeyWord, isTitle: 'false' }, params: { page: 1, mode: 'correlation' } })
}

// 重置输入框事件
const handleReset = () => {
    form.searchKeyWord = ''
}

// 返回首页事件
const handleReturnIndex = () => {
    router.push({ name: 'index' })
}

// 记录当前的排序方式
const sortOrder = computed(() => {
    return route.params.mode
})

// 处理菜单点击事件
// 页面跳转不能使用form表单的数据
// 因为有可能用户改变了表单的数据，但没有进行搜索
const handleCorrelationSort = async (e: any) => {
    e.preventDefault()
    router.push({ name: 'result', query: { searchKey: route.query.searchKey, isTitle: route.query.isTitle }, params: { page: 1, mode: 'correlation' } })
}

const handleTimeSort = async (e: any) => {
    e.preventDefault()
    router.push({ name: 'result', query: { searchKey: route.query.searchKey, isTitle: route.query.isTitle }, params: { page: 1, mode: 'time' } })
}

// 分页部分
const total = computed(() => {
    return newsStore.total
})
const limit = 10
const currentPage = computed(() => {
    return parseInt(route.params.page as string)
})

// 点击分页具体页码处理函数
const handleCurrentChange = (e: any) => {
    router.push({ name: 'result', query: { searchKey: route.query.searchKey, isTitle: route.query.isTitle }, params: { page: e, mode: sortOrder.value } })
}

// 点击前一页按钮处理函数
const handlePrevClick = () => {
    router.push({ name: 'result', query: { searchKey: route.query.searchKey, isTitle: route.query.isTitle }, params: { page: currentPage.value - 1, mode: sortOrder.value } })
}

// 点击下一页按钮处理函数
const handleNextClick = () => {
    router.push({ name: 'result', query: { searchKey: route.query.searchKey, isTitle: route.query.isTitle }, params: { page: currentPage.value + 1, mode: sortOrder.value } })
}

// 点击具体新闻处理函数
const handleClickNews = (url: string) => {
    // 跳转到新闻来源页面
    window.open(url)
}


// 时钟动态效果
onMounted(() => {
    setInterval(() => {
        const hh = document.getElementById('hh') as HTMLElement
        const mm = document.getElementById('mm') as HTMLElement
        const ss = document.getElementById('ss') as HTMLElement
        const sec_dot = document.querySelector('.sec_dot') as HTMLElement
        const min_dot = document.querySelector('.min_dot') as HTMLElement
        const hr_dot = document.querySelector('.hr_dot') as HTMLElement
        const hours = document.getElementById('hours') as HTMLElement
        const minutes = document.getElementById('minutes') as HTMLElement
        const seconds = document.getElementById('seconds') as HTMLElement
        const ampm = document.getElementById('ampm') as HTMLElement
        let h = new Date().getHours()
        const m = new Date().getMinutes()
        const s = new Date().getSeconds()
        let am = h >= 12 ? 'PM' : 'AM'
        // 24小时 转换为 12小时
        if (h > 12) {
            h = h - 12
        }
        // 个位数 前面加 0
        const H = (h < 10 ? '0' + h : h) as string
        const M = (m < 10 ? '0' + m : m) as string
        const S = (s < 10 ? '0' + s : s) as string
        if (hours) {
            hours.innerHTML = H

        }
        if (minutes) {
            minutes.innerHTML = M
        }
        if (seconds) {
            seconds.innerHTML = S
        }
        if (ampm) {
            ampm.innerHTML = am
        }
        if (hh) {
            hh.style.strokeDashoffset = (510 - (510 * h) / 12).toString()
            // 12 hrs clock
        }
        if (mm) {
            mm.style.strokeDashoffset = (630 - (630 * m) / 60).toString()
            // 60 minutes
        }
        if (ss) {
            ss.style.strokeDashoffset = (760 - (760 * s) / 60).toString()
            // 60 seconds
        }
        if (hr_dot) {
            hr_dot.style.transform = `rotateZ(${h * 30}deg)`
            // 360/ 12小时 = 30

        }
        if (min_dot) {
            min_dot.style.transform = `rotateZ(${m * 6}deg)`
            // 360/ 60分钟 = 6

        }
        if (sec_dot) {
            sec_dot.style.transform = `rotateZ(${s * 6}deg)`
            // 360/ 60秒 = 6
        }
    })
})



// 图表数据
const time = computed(() => {
    return newsStore.heatData?.time
})
const count = computed(() => {
    return newsStore.heatData?.count
})
// echarts实例
let chart: any = null
// 当数据发生变化时重新加载图表
watch(count, (newVal, oldVal) => {
    if (chart) {
        chart.dispose()
    }
    chart = initChart()
})
// 初始化图表
const initChart = () => {
    type EChartsOption = echarts.ComposeOption<
        | BarSeriesOption
        | LineSeriesOption
        | TitleComponentOption
        | TooltipComponentOption
        | GridComponentOption
        | DatasetComponentOption
    >
    const myChart = echarts.init(document.querySelector('.heat-container') as HTMLElement)
    window.addEventListener('resize', function () {
        myChart.resize()
    })
    const option: EChartsOption = {
        title: {
            text: '关键词近一周热度',
            left: 'center',
            textStyle: {
                color: '#c3bef0'
            }
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            type: 'category',
            data: time.value,
            name: '发布时间',
            nameLocation: 'middle',
            nameTextStyle: {
                color: '#4d4545',
                padding: [16, 0, 0, 0]
            },
            axisLine: {
                lineStyle: {
                    color: '#8f8787'
                }
            }
        },
        yAxis: {
            type: 'value',
            name: '发布数量',
            nameTextStyle: {
                color: '#4d4545',
                padding: [0, 0, 16, 0]
            }
        },
        series: [
            {
                data: count.value,
                type: 'line',
                smooth: true,
                name: '数量',
                legendHoverLink: true,
                color: '#fb929e'
            }
        ]
    }
    option && myChart.setOption(option, true)
    return myChart
}
// 配置热度图表
onMounted(() => {
    if (!chart) {
        chart = initChart()
    }
})

</script>

<template>
    <div class="result-container">
        <el-scrollbar>
            <el-container>
                <el-header height="80px" class="myHeader">
                    <!-- 标题文字 -->
                    <div class="title-container animate__animated animate__lightSpeedInLeft" @click="handleReturnIndex">
                        <div class="title" data-content="newssearch">newssearch</div>
                    </div>
                    <!-- 搜索框 -->
                    <el-form class="animate__animated animate__fadeInDown w-37/100 ml-5" :model="form" @submit.prevent>
                        <el-form-item class="m-0">
                            <el-input class="search-input" v-model.trim="form.searchKeyWord" placeholder="请输入关键词"
                                @keyup.enter="handleSearch" autofocus>
                                <template #prefix>
                                    <div class="licon" @click="handleReset"></div>
                                </template>
                                <template #suffix>
                                    <el-tooltip effect="light" content="搜索" placement="right" :show-arrow="false"
                                        :show-after="300">
                                        <el-icon @click="handleSearch" class="ricon">
                                            <Search />
                                        </el-icon>
                                    </el-tooltip>
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-form>
                    <div class="menu animate__animated animate__flipInX">
                        <a href="" :class="sortOrder === 'correlation' ? 'active' : ''"
                            @click="handleCorrelationSort">相关度</a>
                        <a href="" :class="sortOrder === 'time' ? 'active' : ''" @click="handleTimeSort">时间</a>
                    </div>
                </el-header>
                <User></User>
                <el-main class="myMain">
                    <div class="news-container animate__animated animate__jackInTheBox">
                        <div v-if="newsList.length > 0">
                            <ul v-for="item in newsList" :key="item.id">
                                <li @click="handleClickNews(item.url)">
                                    <div class="news-msg">
                                        <h2>{{ item.title }}</h2>
                                        <div class="content">{{ item.content }}</div>
                                        <div class="source">{{ item.time + ' ' + item.source }}</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div v-else class="emptyNews">
                            <h2>未查询到相关新闻</h2>
                        </div>
                        <div class="pagination-container">
                            <el-pagination background layout="prev, pager, next" :page-size="limit" :total="total"
                                :current-page="currentPage" :hide-on-single-page="true" next-icon="CaretRight"
                                prev-icon="CaretLeft" @current-change="handleCurrentChange" @prev-click="handlePrevClick"
                                @next-click="handleNextClick" />
                        </div>
                    </div>
                    <div class="ext-container animate__animated animate__zoomInUp">
                        <div id="time">
                            <div class="circle" style="--clr:#7dace4">
                                <div class="dots sec_dot"></div>
                                <svg>
                                    <circle cx="120" cy="120" r="120" id="ss"></circle>
                                </svg>
                            </div>
                            <div class="circle" style="--clr:#ff8264">
                                <div class="dots min_dot"></div>
                                <svg>
                                    <circle cx="100" cy="100" r="100" id="mm"></circle>
                                </svg>
                            </div>
                            <div class="circle" style="--clr:#ff99fe">
                                <div class="dots hr_dot"></div>
                                <svg>
                                    <circle cx="80" cy="80" r="80" id="hh"></circle>
                                </svg>
                            </div>
                            <div class="time-box">
                                <div id="hours" style="--c:#ff99fe">00</div>
                                <div id="minutes" style="--c:#ff8264">00</div>
                                <div id="seconds" style="--c:#7dace4">00</div>
                                <div class="ap" style="--c:#11d3bc">
                                    <div id="ampm">AM</div>
                                </div>
                            </div>
                        </div>
                        <!-- 热度图表容器 -->
                        <div class="heat-container"></div>
                    </div>
                </el-main>
            </el-container>
        </el-scrollbar>
    </div>
</template>

<style lang="less" scoped>
.result-container {
    height: 100%;

    .myHeader {
        background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        opacity: 0.8;
        box-shadow: 0 1px 4px 0 #c2ccd0;
        z-index: 999;
        @apply flex items-center fixed w-full rounded-b-2xl;

        // 标题LOGO样式
        .title-container {
            .title {
                font-family: Arial, Helvetica, sans-serif;
                font-weight: 800;
                width: max-content;
                color: gray;
                position: relative;
                text-transform: uppercase;
                font-size: 30px;
                cursor: pointer;

                &::after {
                    content: 'newssearch';
                    position: absolute;
                    inset: 0;
                    background-image: linear-gradient(to right,
                            rgb(236, 72, 153),
                            rgb(239, 68, 68),
                            rgb(234, 179, 8));
                    background-clip: text;
                    -webkit-background-clip: text;
                    color: transparent;
                    clip-path: ellipse(30px 30px at 0% 50%);
                    animation: slide 3s ease-in infinite;
                    text-transform: uppercase;
                }

                @keyframes slide {
                    50% {
                        clip-path: ellipse(30px 30px at 100% 50%);
                    }

                    to {
                        clip-path: ellipse(30px 30px at 0% 50%);
                    }
                }
            }
        }

        .search-input {
            font-family: LXGW-XiHei;
            height: 50px;

            // 输入框样式
            :deep(.el-input__wrapper) {
                border-radius: 10px;
                box-shadow: 0 1px 4px 0 gray;
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
            box-shadow: 0 2px 6px 0 gray;
        }

        // 菜单样式
        .menu {
            margin-left: 6em;
            font-family: LXGW-XiHei;
            display: grid;
            grid-template-columns: repeat(auto-fit, 1fr);
            grid-auto-flow: column;
            gap: 2em;

            a {
                font-size: 16px;
                color: #7c7575;
                text-decoration: none;
                position: relative;
                padding: 0 10px;

                &:hover {
                    color: #b61aae;

                    &::after {
                        width: 100%;
                    }
                }

                &::after {
                    content: '';
                    transition: all 0.3s ease;
                    position: absolute;
                    height: 3px;
                    bottom: -5px;
                    left: 0;
                    width: 0;
                    background-image: linear-gradient(to right, #74ebd5 0%, #9face6 100%);
                }
            }

            .active {
                color: #b61aae;

                &::after {
                    width: 100%;
                }
            }
        }
    }

    .myMain {
        @apply mt-20 w-full h-full;

        .news-container {
            width: 53vw;
            height: auto;
            @apply mr-5 relative;
            background: #f3f9f1;
            z-index: 0;
            font-family: LXGW-XiHei;
            border-radius: 16px;
            box-shadow: 0px 0px 13px 1px rgba(51, 51, 51, 0.1);

            .news-msg {
                @apply flex-col items-center p-4 cursor-pointer;
                border-radius: 16px;

                h2 {
                    font-size: 24px;
                    color: #4b5cc4;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                .content {
                    margin-top: 5px;
                    font-size: 16px;
                    color: #a1afc9;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    word-break: break-all;
                }

                .source {
                    font-size: 14px;
                    color: #db5a6b;
                    margin-top: 10px;
                }

                &:hover {
                    background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);
                    outline: 1px #cadefc dashed;

                    h2 {
                        color: #71c9ce;
                        text-decoration: underline;
                    }
                }
            }

            .emptyNews {
                @apply flex-col items-center justify-center p-4 cursor-default;
                height: calc(100vh - 160px);
                background: #f3f9f1;
                border-radius: 16px;

                h2 {
                    font-size: 30px;
                    color: #ea5455;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
            }

            .pagination-container {
                @apply flex justify-center items-center mt-5 mb-5;

                /* 对页数的样式进行修改 */
                :deep(.el-pagination).is-background .el-pager li {
                    background-color: #f3f9f1;
                    border-radius: 0%;
                    margin: 0 1.5em;
                    color: #808080;
                }

                /* 对下一页的按钮样式进行修改 */
                :deep(.el-pagination).is-background .btn-next {
                    background-color: #f3f9f1;
                    border-radius: 2px;
                    color: #a6acec;
                }

                // 修改后一页按钮hover样式
                :deep(.el-pagination).is-background .btn-next:hover {
                    background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);
                }

                /* 对上一页的按钮样式进行修改 */
                :deep(.el-pagination).is-background .btn-prev {
                    background-color: #f3f9f1;
                    border-radius: 2px;
                    color: #a6acec;
                }

                // 修改前一页按钮hover样式
                :deep(.el-pagination).is-background .btn-prev:hover {
                    background-image: linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%);
                }

                /* 当前选中页数的样式进行修改 */
                :deep(.el-pagination).is-background .el-pager li:not(.disabled).is-active {
                    background-image: linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%);
                    border-radius: 10px;
                    color: #eaf6f6;
                }

                /* 当前选中页数的样式进行修改 */
                :deep(.el-pagination).is-background .el-pager li:not(.disabled, .is-active):hover {
                    border-bottom: 2px solid #f9a1bc;
                }
            }
        }

        .ext-container {
            width: 42vw;
            height: calc(100vh - 120px);
            position: absolute;
            right: 20px;
            top: 100px;
            border-radius: 16px;
            background-color: #CDDCDC;
            background-image: radial-gradient(at 50% 100%, rgba(255, 255, 255, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%), linear-gradient(to bottom, rgba(255, 255, 255, 0.25) 0%, rgba(0, 0, 0, 0.25) 100%);
            background-blend-mode: screen, overlay;
            box-shadow: 0px 0px 13px 1px rgba(51, 51, 51, 0.1);
            @apply flex flex-col items-center pt-6;

            #time {
                position: relative;
                width: 250px;
                height: 250px;
                display: flex;
                align-items: center;
                justify-content: center;

                .circle {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    svg {
                        position: relative;
                        transform: rotate(270deg);

                        circle {
                            width: 100%;
                            height: 100%;
                            fill: transparent;
                            stroke: var(--clr);
                            stroke-width: 5;
                            transform: translate(5px, 5px);
                            opacity: .25;
                        }
                    }

                    &:nth-child(1) svg {
                        width: 250px;
                        height: 250px;

                        circle {
                            stroke-dasharray: 760;
                            stroke-dashoffset: 760;
                        }
                    }

                    &:nth-child(2) svg {
                        width: 210px;
                        height: 210px;

                        circle {
                            stroke-dasharray: 630;
                            stroke-dashoffset: 630;
                        }
                    }

                    &:nth-child(3) svg {
                        width: 170px;
                        height: 170px;

                        circle {
                            stroke-dasharray: 510;
                            stroke-dashoffset: 510;
                        }
                    }

                    .dots {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        z-index: 10;

                        &::before {
                            content: '';
                            position: absolute;
                            width: 15px;
                            height: 15px;
                            background-color: var(--clr);
                            border-radius: 100%;
                            top: -3px;
                            box-shadow: 0 0 20px var(--clr), 0 0 40px var(--clr), 0 0 60px var(--clr), 0 0 80px var(--clr);
                        }
                    }
                }

                .time-box {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    color: #fff;
                    gap: 15px;
                    font-family: consolas;
                    font-weight: bold;
                    font-size: 1.5em;

                    #hours::after,
                    #minutes::after {
                        content: ':';
                        position: absolute;
                    }

                    div {
                        color: var(--c);
                        text-shadow: 0 0 10px var(--c), 0 0 20px var(--c);
                    }

                    .ap {
                        position: absolute;
                        transform: translateY(-15px);
                        font-size: 0.5em;
                        right: 56px;
                    }
                }
            }

            .heat-container {
                position: absolute;
                bottom: 20px;
                width: 90%;
                height: 42%;
            }
        }
    }
}
</style>