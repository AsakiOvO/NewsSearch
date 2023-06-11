// 用户路由的处理函数
// 导入数据库糙作模块
const db = require('../db/index')
// 导入数据加密bcrypt
const bcrypt = require('bcrypt')
// 导入生成token的包
const jwt = require('jsonwebtoken')
// 导入配置文件
const config = require('../config/index')

// 注册
exports.register = (req, res) => {
    // 拿到表单数据
    let { username, nickname, password } = req.body
    // 判断账号是否重复
    let sql = 'select * from user where username = ?'
    db.query(sql, [username], (err, results) => {
        if (err) {
            return res.err(err)
        }
        // 用户名已被占用
        if (results.length > 0) {
            return res.err('账号已被占用！')
        }
        // 用户名未占用
        // 密码加密
        password = bcrypt.hashSync(password, 10)
        sql = 'insert into user set ?'
        db.query(sql, { username, password, nickname }, (err, results) => {
            if (err) {
                return res.err(err)
            }
            if (results.affectedRows !== 1) {
                return res.err('注册用户失败，请稍后重试！')
            }
            // 注册成功
            res.send({
                status: 0,
                message: '注册成功！'
            })
        })
    })
}
// 登录
exports.login = (req, res) => {
    // 拿到表单数据
    const { username, password } = req.body
    // 拿到数据库中相应的用户的密码
    const sql = 'select * from user where username = ?'
    db.query(sql, [username], (err, results) => {
        // 查询出错
        if (err) {
            return res.err(err)
        }
        if (results.length !== 1) {
            return res.err('账号不存在！')
        }
        // 拿到数据库中的密码，进行解密，与前端传过来的密码进行比较
        // 判断是否登录成功
        const compareResult = bcrypt.compareSync(password, results[0].password)
        if (!compareResult) {
            return res.err('密码错误！')
        }
        // 登陆成功 生成token
        // 只提取账号和昵称
        const user = { id: results[0].id, username: results[0].username, nickname: results[0].nickname }
        const token = jwt.sign(user, config.jwtMessage.jwtSecretKey, {
            // 过期时间
            expiresIn: config.jwtMessage.expiresIn
        })
        // 将token响应给客户端
        res.send({
            status: 0,
            message: '登录成功！',
            token: 'Bearer ' + token
        })
    })
}
