// 获取央视新闻数据

// 导入axios
const axios = require('axios')
// 导入cheerio
const cheerio = require('cheerio')

// 导入查重模块
const addNewsData = require('./addNewsData')
// 导入配置文件
const config = require('../config/index')
// 导入数据库
const db = require('../db/index')

// 保存新闻所有url
const host = 'https://news.cctv.com'
const urls = []
for (let i = 1; i <= 7; i++) {
    urls.push(`${host}/2019/07/gaiban/cmsdatainterface/page/news_${i}.jsonp?cb=news`)
}

// 获取央视新闻网滚动页面的单个页面的新闻数据
const getData = async (url) => {
    const { status, data: res } = await axios.get(url)
    // 请求数据成功
    if (status === 200) {
        // 响应数据是一个回调函数  提取其中的实参
        const num1 = res.indexOf('(')
        const num2 = res.lastIndexOf(')')
        const data = JSON.parse(res.substring(num1 + 1, num2))
        let target = data.data.list
        // 拿到每个新闻页面的url
        // 排除图片频道的新闻
        target = target.filter((item) => {
            return !item.url.includes('photo')
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
                return err
            }
            conn.query(sql, [], (err, results) => {
                conn.destroy()
                if (err) {
                    return err
                }
                // 对数据库存在的url进行剔除
                const temp = results.map((item) => {
                    return item.url
                })
                target = target.filter((item) => {
                    return !temp.includes(item.url)
                })
                // 爬取具体新闻
                target.forEach((item) => {
                    getNewsMessage(item.url)
                })
            })
        })
    }
}

// 获取详细信息
const getNewsMessage = async (url) => {
    const { status, data: res } = await axios.get(url)
    // 请求数据成功
    if (status === 200) {
        const $ = cheerio.load(res)
        const message = {
            title: '',
            source: '',
            time: '',
            content: '',
            url: ''
        }
        message.url = url

        const title = $('#title_area > h1').text().trim()
        // 判断title是否为空
        if (title) {
            message.title = title
        }

        // 判断info里面有没有js标签
        if ($('#title_area > div > script').text().trim()) {
            const source = $('#title_area > div > span').text().trim()
            if (source) {
                const temp = source.split('2023')
                message.source = ('来源：' + temp[0]).trim()
                message.time = ('2023' + temp[1]).trim()
            }
        } else {
            const source = $('#title_area > div.info').text().trim()
            // 判断来源和时间是否为空
            if (source) {
                const temp = source.split('|')
                message.source = temp[0].trim()
                message.time = temp[1].trim()
            }
        }

        // 判断包裹内容的标签是什么
        if ($('#content_area p').text().trimEnd()) {
            // 如果有视频  也就是有script标签  有js脚本
            if ($('#content_area p script').text().trim()) {
                // 删除该p标签里的script标签
                $('#content_area p script').remove()
            }
            const content = $('#content_area p').text().trimEnd()
            if (content) {
                message.content = content
            }
        } else {
            // 如果有视频  也就是有script标签  有js脚本
            if ($('#text_area p script').text().trim()) {
                // 删除该p标签里的script标签
                $('#text_area p script').remove()
            }
            const content = $('#text_area p').text().trimEnd()
            if (content) {
                message.content = content
            }
        }
        // 得到新闻数据，将非空数据保存到数据库中
        if (message.title && message.time && message.source && message.content) {
            // 在保存数据库前，要对新闻进行查重
            // 也就是通过比较新闻标题相似度进行查重
            addNewsData(message, config.newsSource.CCTV)
        }
    }
}

// 获取所有新闻数据
module.exports = getCCTVNewsData = () => {
    urls.forEach((item) => {
        getData(item)
    })
}
