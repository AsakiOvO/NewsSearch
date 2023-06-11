const { addHistory, getHistory, removeAll } = require('../router_handler/history')

const express = require('express')

const router = express.Router()

// 添加搜索历史
router.post('/addHistory', addHistory)

// 获取搜索历史
router.get('/getHistory', getHistory)

// 删除搜索历史
router.post('/removeAll', removeAll)

module.exports = router
