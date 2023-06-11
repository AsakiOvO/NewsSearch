// 导入axios
const axios = require('axios')
// 导入cheerio
const cheerio = require('cheerio')
// 导入配置文件
const config = require('../../config/index')
// 导入数据库
const db = require('../../db/index')

// 保存新闻所有url
const host = 'https://www.chinanews.com.cn'
const urls = []
for (let i = 1; i <= 10; i++) {
    urls.push(`${host}/scroll-news/news${i}.html`)
}

// 获取中国新闻网滚动页面的单个页面的新闻数据
const getData = (url) => {
    return new Promise(async (resolve, reject) => {
        const { status, data: res } = await axios.get(url)
        // 请求数据成功
        if (status === 200) {
            const $ = cheerio.load(res)
            // 保存新闻url链接
            let target = []
            // 获取具体新闻链接
            $('div.content-left > div.content_list > ul > li > div.dd_bt > a').each((i, item) => {
                // 排除视频新闻和图片新闻
                if (!$(item).attr('href').includes('shipin') && !$(item).attr('href').includes('tp')) {
                    // getNewsMessage(host + $(item).attr('href'))
                    target.push(host + $(item).attr('href'))
                }
            })
            // 拼接sql语句
            let sql = 'select url from news where'
            target.forEach((url, index) => {
                if (index === target.length - 1) {
                    sql += ` url = '${url}'`
                } else {
                    sql += ` url = '${url}' or`
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
                    target = target.filter((url) => {
                        return !temp.includes(url)
                    })
                    const list = []
                    // 爬取具体新闻
                    for (let key in target) {
                        try {
                            const message = await getNewsMessage(target[key])
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
        const { status, data: res } = await axios.get(url)
        // 请求数据成功
        if (status === 200) {
            const $ = cheerio.load(res)
            const message = {
                title: '',
                content: '',
                time: '',
                source: '',
                url: '',
                class: 0
            }
            message.url = url

            const title = $('#cont_1_1_2 > div.content_maincontent_more > h1').text().trim()
            // 判断title是否为空
            if (title) {
                message.title = title
            }

            // 判断来源内容是否包含a链接
            if ($('#cont_1_1_2 > div.content_maincontent_more > div.content_left_time > a').text().trim()) {
                const source = $('#cont_1_1_2 > div.content_maincontent_more > div.content_left_time > a').text().trim()
                const time = $('#cont_1_1_2 > div.content_maincontent_more > div.content_left_time').clone().children().remove().end().text().trim()
                const temp = (time + source).split('来源')
                temp[0] = temp[0].trim()
                temp[1] = '来源' + temp[1]
                message.time = temp[0]
                message.source = temp[1]
            } else {
                const time = $('#cont_1_1_2 > div.content_maincontent_more > div.content_left_time').clone().children().remove().end().text().trim()
                if (time) {
                    const temp = time.split('来源')
                    temp[0] = temp[0].trim()
                    temp[1] = '来源' + temp[1]
                    message.time = temp[0]
                    message.source = temp[1]
                }
            }
            const content = $('#cont_1_1_2 > div.content_maincontent_more > div.content_maincontent_content > div.left_zw > p').text().trimEnd()
            // 判断新闻内容是否为空
            if (content) {
                message.content = content.replace(/\'/g, '\\\'')
            }
            // 得到新闻数据，将非空数据保存到数据库中
            if (message.title && message.time && message.source && message.content) {
                message.class = config.newsSource.China
                resolve(message)
            } else {
                resolve(null)
            }
        } else {
            reject(new Error(`请求失败，错误码：${status}`))
        }
    })
}

// 获取所有新闻数据
module.exports = getChinaNewsData = () => {
    return new Promise(async (resolve, reject) => {
        const list = []
        for (let key in urls) {
            try {
                list.push(...await getData(urls[key]))
            } catch (error) {
                reject(error)
            }
        }
        resolve(list)
    })
}