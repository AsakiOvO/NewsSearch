import { reactive, ref } from 'vue'
import type Dialog from '@/components/Dialog.vue'
import type { FormInstance, FormRules } from 'element-plus'
// 导入各api
import { login, getUserInfo, register, updatePwd } from '@/api/user'
// 导入封装的cookie相关操作
import { setToken, removeToken } from '@/utils/cookie'
// 导入pinia
import { useUserStore } from '@/stores/user'
import { showMessage } from '@/utils/message'

export const useHandleDialog = () => {
    const dialogRef = ref<typeof Dialog>()

    // 弹窗样式数据
    const dialogData = reactive({
        title: '',
        width: '',
        confirmText: ''
    })

    // 注册数据
    const registerForm = reactive({
        username: '',
        nickname: '',
        password: '',
        confirmPassword: ''
    })

    // 登录数据
    const loginForm = reactive({
        username: '',
        password: ''
    })

    // 修改密码数据
    const updatePwdForm = reactive({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    // 清除登录表单数据
    const resetLoginForm = () => {
        loginForm.username = ''
        loginForm.password = ''
    }

    // 清除注册表单数据
    const resetRegisterForm = () => {
        registerForm.username = ''
        registerForm.nickname = ''
        registerForm.password = ''
        registerForm.confirmPassword = ''
    }

    // 清除修改密码表单数据
    const resetUpdatePwdForm = () => {
        updatePwdForm.oldPassword = ''
        updatePwdForm.newPassword = ''
        updatePwdForm.confirmPassword = ''
    }

    // 登录表单实例
    const loginFormRef = ref<FormInstance>()
    // 注册表单实例
    const registerFormRef = ref<FormInstance>()
    // 修改密码表单实例
    const updatePwdFormRef = ref<FormInstance>()


    // 登录数据的表单验证
    const loginRules = reactive<FormRules>({
        username: [
            { required: true, message: '账号不能为空', trigger: 'blur' },
            { pattern: /^[a-zA-Z0-9]{1,10}$/, message: '账号只能由字母或者数字组成，且长度在1-10之间', trigger: 'blur' }
        ],
        password: [
            { required: true, message: '密码不能为空', trigger: 'blur' },
            { pattern: /^[\S]{6,18}$/, message: '密码应该由非空字符组成，且长度在6~18位之间', trigger: 'blur' }
        ]
    })


    // 注册数据的表单验证
    const validateConfirmPassword = (rules: any, value: any, callback: any) => {
        if (registerForm.password !== value) {
            callback(new Error('确认密码与密码不一致'))
        }
        // 所有情况都要调用callback()
        callback()
    }
    // 注册数据的表单验证
    const registerRules = reactive<FormRules>({
        username: [
            { required: true, message: '账号不能为空', trigger: 'blur' },
            { pattern: /^[a-zA-Z0-9]{1,10}$/, message: '账号只能由字母或者数字组成，且长度在1-10之间', trigger: 'blur' }
        ],
        nickname: [
            { required: true, message: '昵称不能为空', trigger: 'blur' },
            { pattern: /^[\S\u4e00-\u9fa5]{3,20}/, message: '昵称应该由非空字符组成，且长度在3~20位之间', trigger: 'blur' }
        ],
        password: [
            { required: true, message: '密码不能为空', trigger: 'blur' },
            { pattern: /^[\S]{6,18}$/, message: '密码应该由非空字符组成，且长度在6~18位之间', trigger: 'blur' }
        ],
        confirmPassword: [
            { required: true, message: '确认密码不能为空', trigger: 'blur' },
            { validator: validateConfirmPassword, message: '确认密码与密码不一致', trigger: 'blur' }
        ]
    })



    // 修改密码数据的表单验证
    const validateNewPassword = (rules: any, value: any, callback: any) => {
        if (updatePwdForm.oldPassword === value) {
            callback(new Error('新密码不能和旧密码一致'))
        }
        // 所有情况都要调用callback()
        callback()
    }

    const validateConfirmPassword_2 = (rules: any, value: any, callback: any) => {
        if (updatePwdForm.newPassword !== value) {
            callback(new Error('确认密码与新密码不一致'))
        }
        // 所有情况都要调用callback()
        callback()
    }

    const updatePwdRules = reactive<FormRules>({
        oldPassword: [
            { required: true, message: '旧密码不能为空', trigger: 'blur' },
            { pattern: /^[\S]{6,18}$/, message: '密码应该由非空字符组成，且长度在6~18位之间', trigger: 'blur' }
        ],
        newPassword: [
            { required: true, message: '新密码不能为空', trigger: 'blur' },
            { pattern: /^[\S]{6,18}$/, message: '密码应该由非空字符组成，且长度在6~18位之间', trigger: 'blur' },
            { validator: validateNewPassword, message: '新密码不能和旧密码一致', trigger: 'blur' }
        ],
        confirmPassword: [
            { required: true, message: '确认密码不能为空', trigger: 'blur' },
            { validator: validateConfirmPassword_2, message: '确认密码与新密码不一致', trigger: 'blur' }
        ]
    })


    // 弹窗确认事件
    const handleConfirm = () => {
        const userStore = useUserStore()
        // 判断是登录事件还是注册事件
        if (dialogData.title === '登录') {
            loginFormRef.value?.validate(async (valid) => {
                if (!valid) {
                    return false
                } else {
                    dialogRef.value?.showLoading()
                    const { data: res } = await login(loginForm)
                    // 登录成功
                    if (res.status === 0) {
                        // 重置表单数据
                        resetLoginForm()
                        showMessage(res.message, 'success')
                        // 将token存入cookie中
                        setToken(res.token)
                        // 获取用户信息
                        const { data: res2 } = await getUserInfo()
                        if (res2.status === 0) {
                            userStore.setUserInfo(res2.data)
                            dialogRef.value?.hideDialog()
                        }
                    }
                    dialogRef.value?.hideLoading()
                }
            })
        } else if (dialogData.title === '注册') {
            registerFormRef.value?.validate(async (valid) => {
                if (!valid) {
                    return false
                } else {
                    dialogRef.value?.showLoading()
                    const { data: res } = await register(registerForm)
                    // 注册成功
                    if (res.status === 0) {
                        // 重置表单数据
                        resetRegisterForm()
                        showMessage(res.message, 'success')
                        dialogRef.value?.hideDialog()
                    }
                    dialogRef.value?.hideLoading()
                }
            })
        } else {
            updatePwdFormRef.value?.validate(async (valid) => {
                if (!valid) {
                    return false
                } else {
                    dialogRef.value?.showLoading()
                    const { data: res } = await updatePwd(updatePwdForm)
                    // 修改密码成功
                    if (res.status === 0) {
                        resetUpdatePwdForm()
                        showMessage(res.message, 'success')
                        // 自动退出登录
                        removeToken()
                        userStore.clearUserInfo()
                        dialogRef.value?.hideDialog()
                    }
                    dialogRef.value?.hideLoading()
                }
            })
        }
    }

    // 关闭弹窗时应该清除密码信息
    const handleClosed = () => {
        if (dialogData.title === '登录') {
            loginForm.password = ''
        } else if (dialogData.title === '注册') {
            registerForm.password = ''
            registerForm.confirmPassword = ''
        } else {
            resetUpdatePwdForm()
        }
    }

    return {
        dialogRef,
        dialogData,
        registerForm,
        loginForm,
        updatePwdForm,
        handleConfirm,
        handleClosed,
        loginRules,
        registerRules,
        updatePwdRules,
        loginFormRef,
        registerFormRef,
        updatePwdFormRef
    }
}