import axios from 'axios'
import { getToken, removeToken } from '@/utils/cookie'
import { showMessage } from '@/utils/message'
import { useNewsStore } from '@/stores/news'

const request = axios.create({
    baseURL: 'http://127.0.0.1:3007',
    headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    }
})

// 请求拦截器
request.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
        config.headers['Authorization'] = token
    }
    return config
}, (err) => {
    return Promise.reject(err)
})

// 响应拦截器
request.interceptors.response.use((response) => {
    if (response.data.status !== 0) {
        showMessage(response.data.message, 'error')

        // 验证响应信息是否是  token验证失败！
        if (response.data.message === 'token验证失败！') {
            // 移除token
            removeToken()
        }

        // 验证响应信息是否是  输入的数据不是关键词！
        if (response.data.message === '输入的数据不是关键词！') {
            // 删除pinia中保存的数据
            const newsStore = useNewsStore()
            newsStore.setNewsList([])
            newsStore.setTotal(0)
        }
    }
    return response
}, (err) => {
    return Promise.reject(err)
})

export default request