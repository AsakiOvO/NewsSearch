// 导入各新闻网站的爬取模块
const getCCTVNewsData = require('./CCTV')
const getChinaNewsData = require('./China')
const getPeopleNewsData = require('./People')

const deduplication = require('./Deduplication')
// 导入清除三十天以前的新闻模块
const clearExpiredNews = require('../clearExpiredNews')
// 导入配置
const config = require('../../config/index')
// 设定定时任务的模块
const shcedule = require('node-schedule')
// 加载jieba分词
const { load, cut } = require('@node-rs/jieba')
// 导入minhash
const { Minhash, LshIndex } = require('minhash')
// 导入md5
const md5 = require('md5')
const db = require('../../db/index')

load()

const getNewsData = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // 清除三十天以前的新闻
            clearExpiredNews()
            const data = []
            data.push(...await getCCTVNewsData())
            data.push(...await getChinaNewsData())
            data.push(...await getPeopleNewsData())
            // 先对爬取的新闻进行去重
            // 保存爬取的新闻中唯一的新闻
            const news = []
            // 创建LshIndex实例
            const lsh = new LshIndex()
            data.forEach((message, index) => {
                // 将文章标题进行分词
                const temp = cut(message.title)
                // 将内容转换为hash值集合
                const m = new Minhash()
                temp.forEach((val) => {
                    m.update(val)
                })
                // 将所有文章标题的minhash加入LSH中
                lsh.insert(`m${index}`, m)
                // 对所有新闻标题的文本相似度进行比较
                const matches = lsh.query(m)
                // 如果在lsh中暂时没有与其相似的，则认为它是唯一的
                if (matches.length === 1 && matches[0] === `m${index}`) {
                    // 生成新闻内容的md5
                    message.content_md5 = md5(message.content)
                    if (!news.find(item => {
                        return item.content_md5 === message.content_md5
                    })) {
                        news.push(message)
                    }
                }
            })
            const newNews = []
            for (let message of news) {
                const result = await deduplication(message)
                if (result) {
                    newNews.push(result)
                }
            }
            if (newNews.length > 0) {
                let sql = `insert into news values `
                newNews.forEach((message, index) => {
                    if (index === newNews.length - 1) {
                        sql += `(null, '${message.title}', '${message.source}', '${message.time}', '${message.content}', '${message.content_md5}', '${message.url}', ${message.class});`
                    } else {
                        sql += `(null, '${message.title}', '${message.source}', '${message.time}', '${message.content}', '${message.content_md5}', '${message.url}', ${message.class}), `
                    }
                })
                // console.dir(newNews);
                db.getConnection((err, conn) => {
                    if (err) {
                        reject(err)
                    }
                    conn.query(sql, [], (err, results) => {
                        conn.destroy()
                        if (err) {
                            return console.log(err.sqlMessage)
                        }
                        console.log(`存入${results.affectedRows}条数据`)
                        resolve('爬虫运行完毕')
                    })
                })
            } else {
                console.log(`存入0条数据`)
                resolve('爬虫运行完毕')
            }
        } catch (error) {
            reject(error)
        }
    })
}

// 设定定时规则
const rule = new shcedule.RecurrenceRule()
rule.hour = config.scheduleRules
rule.minute = 0
rule.second = 0

// 定时执行爬取新闻数据
shcedule.scheduleJob(rule, async () => {
    try {
        const reuslt = await getNewsData()
        console.log(reuslt)
    } catch (error) {
        console.error(error)
    }
})
// 立即执行一次爬虫
getNewsData().then(resolve => {
    console.log(resolve)
}).catch(reject => {
    console.log(reject)
})
