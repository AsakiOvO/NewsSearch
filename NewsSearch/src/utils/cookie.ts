import { useCookies } from '@vueuse/integrations/useCookies'

const tokenKey = 'user-token'
const cookie = useCookies()

// 设置token
export const setToken = (value: string) => {
    // 10小时后过期
    cookie.set(tokenKey, value, { maxAge: 60 * 60 * 10 })
}

// 拿到token
export const getToken = () => {
    return cookie.get(tokenKey)
}

// 清除token
export const removeToken = () => {
    cookie.remove(tokenKey)
}
