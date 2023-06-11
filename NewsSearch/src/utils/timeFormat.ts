export const useTimeFormat = () => {
    const handleTimeFormat = (val: string) => {
        const date = new Date(val)
        const year = date.getFullYear()
        const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth()
        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
        const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
        const minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
        const second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
        const time = year + '年' + month + '月' + day + '日' + ' ' + hour + ':' + minute + ':' + second
        return time
    }

    // 获取当前时间
    const handleNowTime = () => {
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth()
        const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
        const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
        const minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
        const second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
        const time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
        return time
    }
    return { handleTimeFormat, handleNowTime }
}