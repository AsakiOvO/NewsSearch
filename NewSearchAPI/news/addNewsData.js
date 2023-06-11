// 导入minhash
const { Minhash, LshIndex } = require('minhash')
// 导入jieba进行中文文本分词
const { cut } = require('@node-rs/jieba')
// 导入db
const db = require('../db/index')
// 导入md5
const md5 = require('md5')

// 将新闻数据添加入数据库中
module.exports = addNewsData = (message, classId) => {
    // 将message的时间格式转换为YYYY-MM-DD的格式
    message.time = message.time.replace('年', '-').replace('月', '-').replace('日', '')
    // 生成新闻内容的md5
    message.content_md5 = md5(message.content)
    db.getConnection((err, conn) => {
        if (err) {
            throw err
        }
        // 在数据库查询爬到的该新闻发布前后一小时内的所有新闻。或者是与该新闻同名的新闻,或者是内容相同的新闻
        // 筛选同名和内容相同的新闻是为了排除某些网站的新闻不具备时效性或者是同一篇新闻多次发布
        let sql = `select title from news where 
        (time >= ? - interval 1 hour and  time <= ?)
        or (time >= ? and time <= ? + interval 1 hour) or title = ? or content_md5 = ?`
        conn.query(sql, [message.time, message.time, message.time, message.time, message.title, message.content_md5], (err, results) => {
            if (err) {
                throw err
            }
            // 创建LshIndex实例
            const index = new LshIndex()
            results.forEach((item, i) => {
                // 将文章标题进行分词
                const temp = cut(item.title)
                // 将内容转换为hash值集合
                const m = new Minhash()
                temp.forEach((val) => {
                    m.update(val)
                })
                // 将所有文章标题的minhash加入LSH中
                index.insert(`m${i}`, m)
            })
            // 将现在爬到的文章标题也进行相同的操作
            const temp = cut(message.title)
            const m = new Minhash()
            temp.forEach((val) => {
                m.update(val)
            })
            index.insert('target', m)
            // 对所有新闻标题的文本相似度进行比较
            const matches = index.query(m)
            conn.destroy()
            // 如果只匹配到目标hash集合
            // 也就是在查询集中与目标hash集合相似度大于等于0.5的只有目标本身
            if (matches.length === 1 && matches[0] === 'target') {
                // 认定目标新闻为新内容，插入到数据库中
                db.getConnection((err, conn) => {
                    if (err) {
                        throw err
                    }
                    sql = 'insert into news set ?'
                    conn.query(sql, { ...message, class: classId }, (err, results) => {
                        conn.destroy()
                        if (err) {
                            // return console.log(err)
                            return console.log('插入数据失败')
                            // return console.log(message)
                        }
                        if (results.affectedRows !== 1) {
                            return console.log('插入失败')
                        }
                        // console.log('插入成功')
                    })
                })
            }
        })
    })
}
