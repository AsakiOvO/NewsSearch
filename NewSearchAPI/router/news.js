const { getSearchTips, getSearchByTips, getNewsByDefault, getNewsByTime, getHeat } = require('../router_handler/news')

const express = require('express')

const router = express.Router()

// 提示用户搜索内容
router.get('/searchTips', getSearchTips)

// 根据关键词搜索新闻
router.get('/search', getNewsByDefault)

// 根据时间降序进行排序新闻
router.get('/searchByTime', getNewsByTime)

// 根据关键词获取近一周热度数据
router.get('/heat', getHeat)

module.exports = router
