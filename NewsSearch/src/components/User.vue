<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog from '@/components/Dialog.vue'
import Drawer from '@/components/Drawer.vue'
import { showMessage } from '@/utils/message'
import { useRouter } from 'vue-router'
// 导入封装的方法
import { useHandleDialog } from '@/utils/handleDialog'
import { getToken, removeToken } from '@/utils/cookie'
import { useTimeFormat } from '@/utils/timeFormat'
// 导入pinia
import { useUserStore } from '@/stores/user'
// 导入api
import { getHistory, removeAllHistory } from '@/api/history'
const userStore = useUserStore()
const router = useRouter()
const { handleTimeFormat } = useTimeFormat()

const isLogin = computed(() => {
    return !getToken() ? false : true
})

const nickname = computed(() => {
    return userStore.userInfo.nickname
})

const props = defineProps({
    textColor: {
        type: String,
        default: 'text-gray-500'
    }
})


const {
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
} = useHandleDialog()

const drawerRef = ref<typeof Drawer>()

// 下拉菜单点击事件
const handleCommand = (command: string) => {
    switch (command) {
        case 'login':
            dialogData.title = '登录'
            dialogData.width = '30%'
            dialogData.confirmText = 'Login'
            dialogRef.value?.showDialog()
            break
        case 'updatePwd':
            dialogData.title = '修改密码'
            dialogData.width = '30%'
            dialogData.confirmText = 'Commit'
            dialogRef.value?.showDialog()
            break
        case 'searchHistory':
            handleGetHistory()
            drawerRef.value?.showDrawer()
            break
        case 'register':
            dialogData.title = '注册'
            dialogData.width = '30%'
            dialogData.confirmText = 'Sign Up'
            dialogRef.value?.showDialog()
    }
}

// 历史记录抽屉组件中点击登录事件
const handleDrawerClickLogin = () => {
    drawerRef.value?.hideDrawer()
    dialogData.title = '登录'
    dialogData.width = '30%'
    dialogData.confirmText = 'Login'
    dialogRef.value?.showDialog()
}

// 退出登录事件
const handleLogout = () => {
    // 清除token
    removeToken()
    // 清除userStore中的数据
    userStore.clearUserInfo()
    // 提示登录成功
    showMessage('退出登录成功', 'success')
}

// 保存搜索历史
const history = ref<[{ [key: string]: any }]>()
// 查询搜索历史处理函数
const handleGetHistory = async () => {
    // 用户登录了才调用api
    if (getToken()) {
        const { data: res } = await getHistory()
        if (res.status === 0) {
            const list = (res.data as [{ [key: string]: any }]).map(item => {
                const temp = { ...item }
                temp.time = handleTimeFormat(item.time)
                return temp
            })
            history.value = list as [{ [key: string]: any }]
        }
    }
}

// 清空搜索历史处理函数
const handleClear = async (e: any) => {
    e.preventDefault()
    const { data: res } = await removeAllHistory()
    if (res.status === 0) {
        showMessage(res.message, 'success')
        history.value = [{}]
    }
}

// 点击历史记录处理函数
const handleClickHistory = (content: string, isTitle: number) => {
    const temp = isTitle === 1 ? 'true' : 'false'
    // 默认是相关度排序
    // 先跳转到空白页，再跳转到目标页，达到刷新的目的
    router.push({ name: 'blank', query: { searchKey: content, isTitle: temp }, params: { page: 1, mode: 'correlation' } })
}
</script>

<template>
    <div class="user-container animate__animated animate__bounce">
        <!-- 下拉菜单 -->
        <el-dropdown class="cursor-pointer " @command="handleCommand">
            <div class="flex justify-center items-center outline-none">
                <el-text :class="textColor" class="mr-2" v-if="isLogin">Hi~ {{ nickname }}</el-text>
                <el-icon :class="textColor">
                    <Grid />
                </el-icon>
            </div>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item v-if="!isLogin" icon="User" command="login">登录</el-dropdown-item>
                    <el-dropdown-item v-else icon="SwitchButton">
                        <el-popconfirm width="220" confirm-button-text="确认" cancel-button-text="取消" icon="Warning"
                            icon-color="#b0a4e3" title="确定要退出登录吗?" :hide-after="100" @confirm="handleLogout">
                            <template #reference>
                                <div>退出登录</div>
                            </template>
                        </el-popconfirm>
                    </el-dropdown-item>
                    <el-dropdown-item v-if="!isLogin" icon="Edit" command="register">注册</el-dropdown-item>
                    <el-dropdown-item v-else icon="Refresh" command="updatePwd">修改密码</el-dropdown-item>
                    <el-dropdown-item icon="List" command="searchHistory">搜索历史</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
    <!-- 登录/注册弹窗 -->
    <Dialog class="myDialog" ref="dialogRef" :width="dialogData.width" :title="dialogData.title"
        :confirm-text="dialogData.confirmText" @confirm="handleConfirm" @closed="handleClosed">
        <template #content>
            <div v-if="dialogData.title === '登录'">
                <el-form ref="loginFormRef" :rules="loginRules" label-position="right"
                    class="max-w-full flex flex-col justify-center items-center" size="large" :model="loginForm">
                    <el-form-item prop="username">
                        <el-input class="w-[250px]" v-model="loginForm.username" placeholder="username" />
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input class="w-[250px]" v-model="loginForm.password" type="password" placeholder="password"
                            show-password />
                    </el-form-item>
                </el-form>
            </div>
            <div v-if="dialogData.title === '注册'">
                <el-form ref="registerFormRef" :rules="registerRules" label-position="right"
                    class="max-w-full flex flex-col justify-center items-center" size="large" :model="registerForm">
                    <el-form-item prop="username">
                        <el-input class="w-[250px]" v-model="registerForm.username" placeholder="username" />
                    </el-form-item>
                    <el-form-item prop="nickname">
                        <el-input class="w-[250px]" v-model="registerForm.nickname" placeholder="nickname" />
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input class="w-[250px]" v-model="registerForm.password" type="password" placeholder="password"
                            show-password />
                    </el-form-item>
                    <el-form-item prop="confirmPassword">
                        <el-input class="w-[250px] rounded-xl" v-model="registerForm.confirmPassword" type="password"
                            placeholder="confirm password" show-password />
                    </el-form-item>
                </el-form>
            </div>
            <div v-if="dialogData.title === '修改密码'">
                <el-form ref="updatePwdFormRef" :rules="updatePwdRules" label-position="right"
                    class="max-w-full flex flex-col justify-center items-center" size="large" :model="updatePwdForm">
                    <el-form-item prop="oldPassword">
                        <el-input class="w-[250px]" v-model="updatePwdForm.oldPassword" type="password"
                            placeholder="old password" show-password />
                    </el-form-item>
                    <el-form-item prop="newPassword">
                        <el-input class="w-[250px]" v-model="updatePwdForm.newPassword" type="password"
                            placeholder="new password" show-password />
                    </el-form-item>
                    <el-form-item prop="confirmPassword">
                        <el-input class="w-[250px] rounded-xl" v-model="updatePwdForm.confirmPassword" type="password"
                            placeholder="confirm password" show-password />
                    </el-form-item>
                </el-form>
            </div>
        </template>
    </Dialog>
    <!-- 历史记录抽屉 -->
    <Drawer ref="drawerRef" title="历史记录" :close-onclick-modal="true" size="85%">
        <template #content>
            <!-- 未登录 -->
            <div v-if="!isLogin" class="flex items-center justify-center">
                <el-link type="primary" @click="handleDrawerClickLogin">请先登录</el-link>
            </div>
            <!-- 历史记录列表 -->
            <el-scrollbar v-else>
                <div class="history-container">
                    <div class="w-full text-right pr-6"><a href="" @click="handleClear">清空搜索历史</a></div>
                    <ul class="w-full" v-for="item in history" :key="item.id">
                        <li @click="handleClickHistory(item.content, item.isTitle)">
                            <el-tooltip effect="dark" :content="item.content" placement="left" :show-arrow="false"
                                :show-after="300">
                                <div class="history">
                                    <h2>{{ item.content }}</h2>
                                    <div class="time">{{ item.time }}</div>
                                </div>
                            </el-tooltip>
                        </li>
                    </ul>
                </div>
            </el-scrollbar>
        </template>
    </Drawer>
</template>

<style scoped lang="less">
.user-container {
    @apply absolute right-4 top-4;
    z-index: 1000;
}

// 输入框样式
:deep(.el-input__wrapper) {
    border: none;
    box-shadow: none;
    border-radius: 0;
    border-bottom: 2px solid #cca8e9;
    background-color: rgba(255, 255, 255, 0);
}

// 输入框hover样式
:deep(.el-input__wrapper):hover {
    border: none;
    box-shadow: none;
    border-radius: 0;
    border-bottom: 2px solid #cadefc;
}

// 输入框focus样式
:deep(.el-input__wrapper.is-focus) {
    box-shadow: none;
    border-radius: 0;
    border-bottom: 2px solid #cadefc;
}

// 验证失败输入框样式
:deep(.el-form-item.is-error .el-input__wrapper) {
    border: none;
    box-shadow: none;
    border-radius: 0;
    border-bottom: 2px solid #ff8c94;
}

// 输入框字体样式
:deep(.el-input__inner) {
    font-size: 18px;
    font-family: LXGW-WenKai;
    @apply text-gray-500;
}

// 弹窗设置字体
.myDialog {
    font-family: SmileySans;

    div {
        font-family: LXGW-XiHei;
    }
}

// 历史模块样式
.history-container {
    @apply flex flex-col items-start justify-center ml-5 mb-5;
    font-family: LXGW-XiHei;

    // 清空搜索历史样式
    a {
        color: #ff7e67;
        transition: all 0.2s ease;
    }

    a:hover {
        color: #fcbad3;
    }

    .history {
        height: 25px;
        line-height: 25px;
        @apply flex cursor-pointer w-full mt-6;

        h2 {
            flex: 3;
            font-size: 17px;
            color: #d291bc;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            transition: all 0.2s ease;
        }

        .time {
            font-size: 14px;
            color: #b8b0b0;
            margin-right: 5px;
            flex: 4;
            transition: all 0.2s ease;
        }
    }

    .history:hover h2 {
        color: #957dad;
    }

    .history:hover .time {
        color: #393e46;
    }
}



:deep(.el-drawer__body) {
    padding: 5px;
}
</style>
