// 配置文件

module.exports = {
    // 保存jasonwebtoken的配置信息
    jwtMessage: {
        // 生成的token密钥
        jwtSecretKey: 'Wang Lian',
        // token有效期
        expiresIn: '10h'
    },
    // 数据库配置信息
    dbMessage: {
        host: 'localhost',
        user: 'root',
        password: 'wl@00000',
        database: 'news_search',
        charset: 'utf8mb4',
        connectionLimit: 20,
        connectionIimeout: 60 * 1000,
        acquireTimeout: 60 * 1000,
        timeout: 60 * 1000
    },
    // 新闻来源
    newsSource: {
        CCTV: 1,
        China: 2,
        People: 3
    },
    // 爬取定时规则
    // 每隔两小时进行自动爬取数据
    scheduleRules: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]
}
