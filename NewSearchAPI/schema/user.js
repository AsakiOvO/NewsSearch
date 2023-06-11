const joi = require('joi')

// 账号验证规则
// alphanum  表示只能是字母或者数字
const username = joi.string().alphanum().min(1).max(10).required()

// 密码验证规则  6-18的非空字符串 不包括汉字
const password = joi
    .string()
    .pattern(/^[\S]{6,18}$/)
    .required()

// 昵称验证规则 3-20的非空字符串 包括汉字
const nickname = joi
    .string()
    .pattern(/^[\S\u4e00-\u9fa5]{3,20}$/)
    .required()

// 确认密码和密码要一致
const confirmPassword = joi.equal(joi.ref('password'))

// 旧密码
const oldPassword = joi
    .string()
    .pattern(/^[\S]{6,18}$/)
    .required()

// 新密码
const newPassword = joi
    .string()
    .pattern(/^[\S]{6,18}$/)
    .required()
    .disallow(joi.ref('oldPassword'))

const confirmPassword2 = joi.equal(joi.ref('newPassword'))

// 注册验证规则对象
exports.registerSchema = {
    body: {
        username,
        nickname,
        password,
        confirmPassword
    }
}

// 登录验证规则对象
exports.loginSchema = {
    body: {
        username,
        password
    }
}

// 修改密码验证规则对象
exports.updatePwdSchema = {
    body: {
        oldPassword,
        newPassword,
        confirmPassword: confirmPassword2
    }
}
