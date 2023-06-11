// 导入express模块
const express = require('express')
// 导入cors中间件  解决跨域问题
const cors = require('cors')
// 导入各路由模块
const userRouter = require('./router/user.js')
const userInfoRouter = require('./router/userInfo.js')
const newsRouter = require('./router/news')
const historyROuter = require('./router/history')
// 导入joi
const joi = require('joi')
// 导入解析token的中间件express-jwt
const { expressjwt } = require('express-jwt')
// 导入配置项
const config = require('./config/index')

// 创建express实例对象
const app = express()

// 将cors注册为全局中间件
app.use(cors())
// 配置解析application/x-www-form-urlencoded格式的表单数据的中间件
app.use(express.urlencoded({ extended: false }))

// 定义响应错误数据的中间件
app.use((req, res, next) => {
    // status = 0为成功，= 1为失败，默认为1
    res.err = (err, status = 1) => {
        res.send({
            status,
            // 判断err是否为错误对象，还是字符串
            message: err instanceof Error ? err.message : err
        })
    }
    next()
})

// 配置解析token的中间件
app.use(expressjwt({ secret: config.jwtMessage.jwtSecretKey, algorithms: ['HS256'] }).unless({ path: [/^\/newsSearch\/api\/user\//, /^\/newsSearch\/api\/news\//] }))

//挂载各路由
app.use('/newsSearch/api/user', userRouter)
app.use('/newsSearch/api/userInfo', userInfoRouter)
app.use('/newsSearch/api/news', newsRouter)
app.use('/newsSearch/api/history', historyROuter)

// 定义错误级别中间件
app.use((err, req, res, next) => {
    // expressJoi验证失败
    if (err instanceof joi.ValidationError) {
        return res.err(err)
    }
    // token验证失败
    if (err.name === 'UnauthorizedError') {
        return res.err('token验证失败！')
    }
    // 其他错误
    res.err(err)
})

// 指定端口号并启动服务器
app.listen(3007, () => {
    console.log('api server is running at http://127.0.0.1:3007')
})
