const db = require('../db/index')
const fs = require('fs')
const path = require('path')
// 导入jieba进行中文文本分词
const { load, extract, loadDict } = require('@node-rs/jieba')
// 导入BM25算法
const BM25 = require('../BM25/index.js')
// 加载分词
// load()
// 加载分词词库
loadDict(fs.readFileSync(path.join(__dirname, '../jiebaconfig/dict_small.txt')))
exports.getSearchTips = (req, res) => {
    const { title } = req.query
    if (title) {
        db.getConnection((err, conn) => {
            if (err) {
                return res.err('数据库连接失败！')
            }
            const temp = extract(title, title.length).map((item) => {
                return item.keyword
            })
            // 用户输入 提取关键词后为空
            if (temp.length === 0) {
                return res.err('输入的数据不是关键词！')
            }
            // 根据用户输入的分词，查询最新相关的十个新闻的标题
            let sql = `select title from news where`
            temp.forEach((item, index) => {
                if (index === 0) {
                    sql += ` title like '%${item}%'`
                } else if (index === temp.length - 1) {
                    sql += ` or title like '%${item}%' order by time desc`
                } else {
                    sql += ` or title like '%${item}%'`
                }
            })
            conn.query(sql, [], (err, results) => {
                conn.destroy()
                if (err) {
                    return res.err('查询数据库失败！')
                }
                if (results.length === 0) {
                    return res.err('未查询到相关数据！')
                }
                res.send({
                    status: 0,
                    message: '获取成功',
                    data: results.slice(0, 10)
                })
            })
        })
    } else {
        res.send({ status: 0, data: null })
    }
}

exports.getNewsByDefault = (req, res) => {
    const { keyword, page, limit, isTitle } = req.query
    // 对关键词进行分词
    const temp = extract(keyword.toUpperCase(), keyword.length).map((item) => {
        return item.keyword
    })
    console.log(temp)
    // 用户输入 提取关键词后为空
    if (temp.length === 0) {
        return res.err('输入的数据不是关键词！')
    }
    // 基于关键词分词搜索相关新闻
    let sql = 'select * from news where'
    // 判断用户是否是点击了新闻推荐进行的搜索
    if (isTitle === 'true') {
        temp.forEach((item, index) => {
            if (index === 0) {
                sql += ` title like '%${item}%'`
            } else {
                sql += ` and title like '%${item}%'`
            }
        })
    } else {
        temp.forEach((item, index) => {
            if (index === 0) {
                sql += ` title like '%${item}%'`
            } else {
                sql += ` or title like '%${item}%'`
            }
        })
    }
    db.getConnection((err, conn) => {
        if (err) {
            return res.err('数据库连接失败！')
        }
        conn.query(sql, [], (err, results) => {
            conn.destroy()
            if (err) {
                return res.err('查询数据库失败！')
            }
            // 对匹配的新闻标题进行分词,并构成数组
            const titles = []
            results.forEach((item) => {
                titles.push(
                    extract(item.title.toUpperCase(), item.title.length).map((val) => {
                        return val.keyword
                    })
                )
            })
            // 调用BM25算法对匹配新闻进行相关度计算
            const bm25 = new BM25()
            bm25.setDocuments(titles)
            bm25.setQuery(temp)
            let correlation = bm25.getCorrelation()
            // 排除其中相关度为0的新闻项
            correlation = correlation.filter((item) => {
                return item.correlation !== 0
            })
            // 将相关性从大到小排序
            correlation.sort((a, b) => {
                return b.correlation - a.correlation
            })
            // 根据相关性的id对新闻进行排序
            const list = []
            correlation.forEach((item) => {
                list.push(results[item.id])
            })
            // 进行分页操作
            if (limit) {
                res.send({
                    status: 0,
                    message: '搜索成功',
                    data: { list: list.slice((page - 1) * limit, page * limit), total: list.length }
                })
            } else {
                res.send({
                    status: 0,
                    message: '搜索成功',
                    data: { list: list.slice((page - 1) * 10, page * 10), total: list.length }
                })
            }
        })
    })
}

exports.getNewsByTime = (req, res) => {
    const { keyword, page, limit, isTitle } = req.query
    // 对关键词进行分词
    const temp = extract(keyword.toUpperCase(), keyword.length).map((item) => {
        return item.keyword
    })
    // 用户输入 提取关键词后为空
    if (temp.length === 0) {
        return res.err('输入的数据不是关键词！')
    }
    // 基于关键词分词搜索相关新闻
    let sql = 'select * from news where'
    // 判断用户是否是点击了新闻推荐进行的搜索
    if (isTitle === 'true') {
        temp.forEach((item, index) => {
            if (index === 0) {
                sql += ` title like '%${item}%'`
            } else {
                sql += ` and title like '%${item}%'`
            }
        })
    } else {
        temp.forEach((item, index) => {
            if (index === 0) {
                sql += ` title like '%${item}%'`
            } else {
                sql += ` or title like '%${item}%'`
            }
        })
    }
    db.getConnection((err, conn) => {
        if (err) {
            return res.err('数据库连接失败！')
        }
        conn.query(sql, [], (err, results) => {
            conn.destroy()
            if (err) {
                return res.err('查询数据库失败！')
            }
            // 对匹配的新闻标题进行分词,并构成数组
            const titles = []
            results.forEach((item) => {
                titles.push(
                    extract(item.title.toUpperCase(), item.title.length).map((val) => {
                        return val.keyword
                    })
                )
            })
            // 调用BM25算法对匹配新闻进行相关度计算
            const bm25 = new BM25()
            bm25.setDocuments(titles)
            bm25.setQuery(temp)
            let correlation = bm25.getCorrelation()
            // 排除其中相关度为0的新闻项
            correlation = correlation.filter((item) => {
                return item.correlation !== 0
            })
            // 将相关性从大到小排序
            correlation.sort((a, b) => {
                return b.correlation - a.correlation
            })
            // 根据相关性的id筛选相关的新闻
            const list = []
            correlation.forEach((item) => {
                list.push(results[item.id])
            })
            // 按时间降序排序
            list.sort((a, b) => {
                return new Date(b.time).getTime() - new Date(a.time).getTime()
            })
            // 进行分页操作
            if (limit) {
                res.send({
                    status: 0,
                    message: '搜索成功',
                    data: { list: list.slice((page - 1) * limit, page * limit), total: list.length }
                })
            } else {
                res.send({
                    status: 0,
                    message: '搜索成功',
                    data: { list: list.slice((page - 1) * 10, page * 10), total: list.length }
                })
            }
        })
    })
}

exports.getHeat = (req, res) => {
    const { keyword } = req.query
    // 对关键词进行分词
    const temp = extract(keyword.toUpperCase(), keyword.length).map((item) => {
        return item.keyword
    })
    // 用户输入 提取关键词后为空
    if (temp.length === 0) {
        return res.err('输入的数据不是关键词！')
    }
    // 基于关键词搜索近一周的相关的新闻
    let sql = `select  DATE_FORMAT(time,'%Y-%m-%d') as time, count(*) as count from news where`
    temp.forEach((item, index) => {
        if (temp.length > 1) {
            if (index === 0) {
                sql += ` (title like '%${item}%'`
            } else if (index === temp.length - 1) {
                sql += ` or title like '%${item}%')`
            } else {
                sql += ` or title like '%${item}%'`
            }
        } else {
            sql += ` (title like '%${item}%')`
        }
    })
    // 拼接时间条件 计算出每一天相关新闻数量
    sql += ` and (time >= CURDATE() - interval 7 day) GROUP BY DATE_FORMAT(time,'%d') ORDER BY time`
    db.getConnection((err, conn) => {
        if (err) {
            return res.err('数据库连接失败！')
        }
        conn.query(sql, [], (err, results) => {
            conn.destroy()
            if (err) {
                return res.err('查询数据库失败！')
            }
            const data = []
            const times = new Date()
            // 格式化返回数据
            for (let i = 6; i >= 0; i--) {
                const temp = times - 1000 * 60 * 60 * 24 * i
                const date = new Date(temp)
                const year = date.getFullYear()
                const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth()
                const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
                const time = year + '-' + month + '-' + day
                const message = results.find((item) => {
                    return item.time === time
                })
                if (message) {
                    data.push(message)
                } else {
                    data.push({ time: time, count: 0 })
                }
            }
            res.send({
                status: 0,
                message: '查找成功！',
                data: data
            })
        })
    })
}
