import { createRouter, createWebHashHistory } from 'vue-router'
import { getToken } from '@/utils/cookie'
import { getUserInfo } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { useNewsStore } from '@/stores/news'
import { getHeat, getNewsByCorrelation, getNewsByTime } from '@/api/news'
// 导入全屏loading处理函数
import { showFullLoading, hideFullLoading } from '@/utils/nprogress'
// 导入需要配置路由的组件
import Index from '@/views/Index.vue'
import Result from '@/views/Result.vue'
import NotFound from '@/views/404.vue'
import Blank from '@/views/Blank.vue'
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', component: Index, name: 'index' },
        { path: '/result/:mode/:page', component: Result, name: 'result' },
        { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
        { path: '/blank/:mode/:page', component: Blank, name: 'blank' }
    ]
})

// 前置路由守卫
router.beforeEach(async (to, from, next) => {
    // 显示全屏loading
    showFullLoading()
    if (getToken()) {
        const { data: res } = await getUserInfo()
        if (res.status === 0) {
            const userStore = useUserStore()
            userStore.setUserInfo(res.data)
        }
    }
    if (to.name === 'result') {
        // 请求新闻数据
        const newsStore = useNewsStore()
        newsStore.setSearchKey(to.query.searchKey as string)

        // 得到热力数据
        const { data: res } = await getHeat(to.query.searchKey as string)
        if (res.status === 0) {
            const temp = res.data as { time: string; count: number }[]
            const time = temp.map(item => {
                return item.time
            })
            const count = temp.map(item => {
                return item.count
            })
            newsStore.setHeatData({ time, count })
        }

        // 请求搜索结果数据
        // 判断用户是根据什么搜索
        if (to.params.mode === 'correlation') {
            const { data: res } = await getNewsByCorrelation(to.query.searchKey as string, to.params.page as unknown as number, to.query.isTitle === 'true' ? true : false)
            // 请求成功
            if (res.status === 0) {
                // 将数据保存到pinia中
                newsStore.setNewsList(res.data.list)
                newsStore.setTotal(res.data.total)
            }
        } else if (to.params.mode === 'time') {
            const { data: res } = await getNewsByTime(to.query.searchKey as string, to.params.page as unknown as number, to.query.isTitle === 'true' ? true : false)
            // 请求成功
            if (res.status === 0) {
                // 将数据保存到pinia中
                newsStore.setNewsList(res.data.list)
                newsStore.setTotal(res.data.total)
            }
        }

    }
    next()
})

// 全局后置守卫
router.afterEach((to, from, failure) => {
    hideFullLoading()
})

export default router
