const db = require('../db/index')

// 清除三十天以前的新闻
module.exports = clearExpiredNews = () => {
    const sql = 'delete from news where time < now() - interval 30 day'
    db.getConnection((err, conn) => {
        if (err) {
            return console.log('数据库连接失败')
        }
        conn.query(sql, [], (err, results) => {
            if (err) {
                return console.log('删除失败')
            }
            console.log(`清除三十天以前的新闻${results.affectedRows}条`)
        })
    })
}