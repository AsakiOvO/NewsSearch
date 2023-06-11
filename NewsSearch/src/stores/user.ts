import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
    const userInfo = ref({
        id: 0,
        username: '',
        nickname: ''
    })

    const setUserInfo = (data: { id: number; username: string; nickname: string }) => {
        userInfo.value.id = data.id
        userInfo.value.username = data.username
        userInfo.value.nickname = data.nickname
    }

    const clearUserInfo = () => {
        userInfo.value.id = 0
        userInfo.value.username = ''
        userInfo.value.nickname = ''
    }

    return { userInfo, setUserInfo, clearUserInfo }
})
