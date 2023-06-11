const db = require('../db')

exports.addHistory = (req, res) => {
    const { content, time } = req.body
    let { isTitle } = req.body
    isTitle = isTitle === 'true' ? 1 : 0
    const sql = 'insert into history set ?'
    db.getConnection((err, conn) => {
        if (err) {
            return res.err('数据库连接失败！')
        }
        conn.query(sql, { content, time, isTitle, user: req.auth.id }, (err, results) => {
            conn.destroy()
            if (err) {
                return res.err('插入出错！')
            }
            if (results.affectedRows !== 1) {
                return res.err('添加历史记录失败！')
            }
            // 添加历史记录成功
            res.send({
                status: 0,
                message: '添加历史记录成功！'
            })
        })
    })
}

exports.getHistory = (req, res) => {
    const sql = 'select * from history where user = ?'
    db.getConnection((err, conn) => {
        if (err) {
            return res.err('数据库连接失败！')
        }
        conn.query(sql, [req.auth.id], (err, results) => {
            conn.destroy()
            if (err) {
                return res.err('查询出错！')
            }
            // 查找历史记录成功
            res.send({
                status: 0,
                message: '查找历史记录成功！',
                data: results
            })
        })
    })
}

exports.removeAll = (req, res) => {
    const sql = 'delete from history where user = ?'
    db.getConnection((err, conn) => {
        if (err) {
            return res.err('数据库连接失败！')
        }
        conn.query(sql, [req.auth.id], (err, results) => {
            conn.destroy()
            if (err) {
                return res.err('删除出错！')
            }
            // 查找历史记录成功
            res.send({
                status: 0,
                message: '清空历史记录成功！'
            })
        })
    })
}
