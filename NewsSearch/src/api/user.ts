import request from '@/utils/request'

// 登录
export const login = (data: { username: string; password: string }) => {
    return request.post('/newsSearch/api/user/login', data)
}

// 请求用户数据
export const getUserInfo = () => {
    return request.get('/newsSearch/api/userInfo/getUserInfo')
}

// 注册
export const register = (data: { username: string; nickname: string; password: string; confirmPassword: string }) => {
    return request.post('/newsSearch/api/user/register', data)
}

// 修改密码
export const updatePwd = (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    return request.post('/newsSearch/api/userInfo/updatePwd', data)
}