import { ElMessage } from 'element-plus'

export const showMessage = (message: string, type: 'success' | 'warning' | 'info' | 'error') => {
    ElMessage({
        message,
        type,
        dangerouslyUseHTMLString: true,
        showClose: true,
        duration: 3000,
        center: true,
        grouping: true
    })
}