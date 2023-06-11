const db = require('../db/index')
// 导入数据加密bcrypt
const bcrypt = require('bcrypt')

// 获取用户信息
exports.getUserInfo = (req, res) => {
    const sql = 'select id, username, nickname from user where id = ?'
    db.query(sql, [req.auth.id], (err, results) => {
        if (err) {
            return res.err(err)
        }
        if (results.length !== 1) {
            return res.err('获取用户信息失败！')
        }
        res.send({
            status: 0,
            message: '获取用户信息成功！',
            data: results[0]
        })
    })
}

// 修改密码
exports.updatePwd = (req, res) => {
    let { oldPassword, newPassword, confirmPassword } = req.body
    let sql = 'select password from user where id = ? and username = ?'
    db.query(sql, [req.auth.id, req.auth.username], (err, results) => {
        if (err) {
            return res.err(err)
        }
        if (results.length !== 1) {
            return res.err('查询用户信息出错！')
        }
        // 判断用户提交的旧密码和数据库中的密码是否一致
        const compareResult = bcrypt.compareSync(oldPassword, results[0].password)
        if (!compareResult) {
            return res.err('输入的旧密码不正确！')
        }
        // 对新密码进行加密
        newPassword = bcrypt.hashSync(newPassword, 10)
        // 执行修改密码
        sql = 'update user set password = ? where id = ? and username = ?'
        db.query(sql, [newPassword, req.auth.id, req.auth.username], (err, results) => {
            if (err) {
                return res.err(err)
            }
            if (results.affectedRows !== 1) {
                return res.err('修改密码失败，请稍后重试！')
            }
            // 修改密码成功
            res.send({
                status: 0,
                message: '修改密码成功，请重新登录！'
            })
        })
    })
}
