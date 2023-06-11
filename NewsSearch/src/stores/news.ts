import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNewsStore = defineStore('news', () => {
    const searchKey = ref('')


    const setSearchKey = (val: string) => {
        searchKey.value = val
    }

    const newsList = ref<{ [key: string]: any }[]>([])

    const setNewsList = (val: { [key: string]: any }[]) => {
        newsList.value = val
    }

    // 新闻总数，用于分页
    const total = ref<number>()

    const setTotal = (val: number) => {
        total.value = val
    }

    // 保存热力数据
    const heatData = ref<{ time: string[]; count: number[] }>()

    const setHeatData = (val: { time: string[]; count: number[] }) => {
        heatData.value = val
    }

    return { searchKey, setSearchKey, newsList, setNewsList, total, setTotal, heatData, setHeatData }
})