import request from '@/utils/request'

// 提示用户新闻
export const getNewsTips = (title: string) => {
    return request.get(`/newsSearch/api/news/searchTips?title=${title}`)
}

// 搜索新闻  按相关度排序
export const getNewsByCorrelation = (searchKey: string, page: number, isTitle = false, limit: number = 10) => {
    return request.get(`/newsSearch/api/news/search?keyword=${searchKey}&page=${page}&limit=${limit}&isTitle=${isTitle}`)
}

// 搜索新闻  按时间排序
export const getNewsByTime = (searchKey: string, page: number, isTitle = false, limit: number = 10) => {
    return request.get(`/newsSearch/api/news/searchByTime?keyword=${searchKey}&page=${page}&limit=${limit}&isTitle=${isTitle}`)
}

// 得到关键词的热度
export const getHeat = (searchKey: string) => {
    return request.get(`/newsSearch/api/news/heat?keyword=${searchKey}`)
}