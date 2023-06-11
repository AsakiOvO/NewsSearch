import nprogress from 'nprogress'

// 显示全屏loading
export function showFullLoading() {
    nprogress.start()
}

// 隐藏全屏loading
export function hideFullLoading() {
    nprogress.done()
}