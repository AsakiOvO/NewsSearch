// 导入各新闻网站的爬取模块
const getCCTVNewsData = require('./getCCTVNews')
const getChinaNewsData = require('./getChinaNews')
const getPeopleNewsData = require('./getPeopleNews')

// 导入清除三十天以前的新闻模块
const clearExpiredNews = require('./clearExpiredNews')
// 导入配置
const config = require('../config/index')
// 设定定时任务的模块
const shcedule = require('node-schedule')
// 加载jieba分词
const { load } = require('@node-rs/jieba')
load()

const getNewsData = () => {
    // 清除三十天以前的新闻
    clearExpiredNews()
    getCCTVNewsData()
    getChinaNewsData()
    getPeopleNewsData()
}

// 设定定时规则
const rule = new shcedule.RecurrenceRule()
rule.hour = config.scheduleRules
rule.minute = 0
rule.second = 0

// 定时执行爬取新闻数据
shcedule.scheduleJob(rule, () => {
    getNewsData()
})
// 立即执行一次爬虫
getNewsData()
