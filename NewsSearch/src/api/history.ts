import request from '@/utils/request'

// 清空搜索历史
export const removeAllHistory = () => {
    return request.post('/newsSearch/api/history/removeAll')
}

// 添加搜索历史
export const addHistory = (data: { content: string; time: string; isTitle: boolean }) => {
    return request.post('/newsSearch/api/history/addHistory', data)
}

// 查询搜索历史
export const getHistory = () => {
    return request.get('/newsSearch/api/history/getHistory')
} 