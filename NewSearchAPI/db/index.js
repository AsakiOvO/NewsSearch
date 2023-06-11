// 导入mysql
const mysql = require('mysql')
// 导入配置文件
const config = require('../config/index')

// 创建数据库连接对象
const db = mysql.createPool(config.dbMessage)

// 导出db对象
module.exports = db
