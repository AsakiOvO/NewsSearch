// 实现用户登录、注册api接口
const express = require('express')
// 导入@escook/express-joi
const expressJoi = require('@escook/express-joi')
// 导入各验证规则对象
const { registerSchema, loginSchema } = require('../schema/user')

// 导入处理函数
const { register, login } = require('../router_handler/user.js')
// 创建路由对象
const router = express.Router()

// 用户注册
router.post('/register', expressJoi(registerSchema), register)

// 用户登录
router.post('/login', expressJoi(loginSchema), login)

// 将路由对象导出
module.exports = router
