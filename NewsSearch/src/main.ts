import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 导入Element-Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入icon
import * as ElementPlusIconsVue from '@element-plus/icons-vue'


// 导入WindiCSS
import 'virtual:windi.css'

// 导入全局css样式
import '@/assets/main.css'
import '@/assets/蜘蛛网特效.js'
// 导入animate动画库
import 'animate.css'

// 导入nprogress的css样式
import 'nprogress/nprogress.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')

