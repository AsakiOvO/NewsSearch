// 获取人民网新闻

// 导入axios
const axios = require('axios')
// 导入cheerio
const cheerio = require('cheerio')
// 导入iconv-lite用于解码
var iconv = require('iconv-lite')
// 导入配置文件
const config = require('../../config/index')
// 导入数据库
const db = require('../../db/index')

// 新闻获取路径
const url = 'http://news.people.com.cn/210801/211150/index.js?_'

// 获取人民网滚动页面的单个页面的新闻数据
const getData = (url) => {
    return new Promise(async (resolve, reject) => {
        const { status, data: res } = await axios.get(url)
        // 请求数据成功
        if (status === 200) {
            let target = res.items
            // 拿到每个新闻页面的url
            // 排除图片频道和 健康频道 和共产党频道 的新闻
            target = target.filter((item) => {
                return !item.url.includes('pic') && !item.url.includes('health') && !item.url.includes('cpc') && !item.url.includes('theory')
            })
            // 将数据库中的数据的url和爬到新闻的url进行比对
            // 不重复才进行爬取具体新闻的操作
            // 拼接sql语句
            let sql = 'select url from news where'
            target.forEach((item, index) => {
                if (index === target.length - 1) {
                    sql += ` url = '${item.url}'`
                } else {
                    sql += ` url = '${item.url}' or`
                }
            })
            // 查询数据库
            db.getConnection((err, conn) => {
                if (err) {
                    reject(err)
                }
                conn.query(sql, [], async (err, results) => {
                    conn.destroy()
                    if (err) {
                        reject(err)
                    }
                    // 对数据库存在的url进行剔除
                    const temp = results.map((item) => {
                        return item.url
                    })
                    target = target.filter((item) => {
                        return !temp.includes(item.url)
                    })
                    const list = []
                    // 爬取具体新闻
                    for (let key in target) {
                        try {
                            const message = await getNewsMessage(target[key].url)
                            if (message) {
                                list.push(message)
                            }
                        } catch (error) {
                            reject(error)
                        }
                    }
                    resolve(list)
                })
            })
        } else {
            reject(new Error(`请求失败，错误码：${status}`))
        }
    })
}

// 获取详细信息
const getNewsMessage = (url) => {
    return new Promise(async (resolve, reject) => {
        // 要解决编码问题
        const { status, data: res } = await axios.get(url, { responseEncoding: 'utf8', responseType: 'arraybuffer' })
        // 请求数据成功
        if (status === 200) {
            const bufs = iconv.decode(res, 'GB2312')
            const html = bufs.toString('utf8')
            const $ = cheerio.load(html)
            const message = {
                title: '',
                content: '',
                time: '',
                source: '',
                url: '',
                class: 0
            }
            message.url = url

            const title = $('body > div.main > div.layout.rm_txt.cf > div.col.col-1 > h1').text().trim()
            // 判断title是否为空
            if (title) {
                message.title = title
            }

            const source = $('body > div.main > div.layout.rm_txt.cf > div.col.col-1 > div.channel.cf > div.col-1-1').text().trim()
            // 判断来源和时间是否为空
            if (source) {
                const temp = source.split('|')
                message.time = temp[0].trim()
                message.source = temp[1].trim()
            }
            // 去除p标签里面的script标签
            if ($('body > div.main > div.layout.rm_txt.cf > div.col.col-1 > div.rm_txt_con.cf p script').text().trim()) {
                $('body > div.main > div.layout.rm_txt.cf > div.col.col-1 > div.rm_txt_con.cf p script').remove()
            }
            let content = $('body > div.main > div.layout.rm_txt.cf > div.col.col-1 > div.rm_txt_con.cf p').text()
            // 判断新闻内容是否为空
            if (content) {
                content = content.replace('分享让更多人看到', '').trimEnd()
                message.content = content.replace(/\'/g, '\\\'')
            }
            // 得到新闻数据
            if (message.title && message.time && message.source && message.content) {
                message.time = message.time.replace('日', '日 ')
                message.class = config.newsSource.People
                resolve(message)
            } else {
                resolve(null)
            }
        } else {
            reject(new Error(`请求失败，错误码：${status}`))
        }
    })
}

module.exports = getPeopleNewsData = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const list = await getData(url)
            resolve(list)
        } catch (error) {
            reject(error)
        }
    })
}
