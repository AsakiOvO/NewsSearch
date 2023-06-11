const express = require('express')
// 导入@escook/express-joi
const expressJoi = require('@escook/express-joi')
// 导入验证规则对象
const { updatePwdSchema } = require('../schema/user')
const { getUserInfo, updatePwd } = require('../router_handler/userInfo.js')
const router = express.Router()

// 获取用户信息
router.get('/getUserInfo', getUserInfo)
// 修改用户密码
router.post('/updatePwd', expressJoi(updatePwdSchema), updatePwd)

module.exports = router
