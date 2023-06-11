module.exports = class BM25 {
    // 配置BM25各各项参数
    // k1,k3可取范围为1.2~2   b取0.75
    k1 = 1.2
    k3 = 1.2
    b = 0.75
    documents = []
    query = []

    constructor(k1 = 1.2, k3 = 1.2, b = 0.75) {
        this.k1 = k1
        this.k3 = k3
        this.b = b
    }
    // 设置匹配文档
    setDocuments(value) {
        this.documents.push(...value)
    }
    // 设置要匹配的内容
    setQuery(value) {
        this.query.push(...value)
    }

    // 计算单词权重IDF
    getIDF(word) {
        const df = this.documents.filter((item) => {
            return item.includes(word)
        }).length
        const IDF = Math.log(1 + (this.documents.length - df + 0.5) / (df + 0.5))
        return IDF
    }

    // 计算文档的平均长度
    getDocumentAvgLlength() {
        // 所有文档的平均长度
        let avgToDocuments = 0
        // 所有文档的总长度
        let sumToDocuments = 0
        this.documents.forEach((item) => {
            sumToDocuments += item.length
        })
        // 计算平均长度
        avgToDocuments = sumToDocuments / this.documents.length
        return avgToDocuments
    }

    // 计算单词与某个文档的相关性
    getCorrelationToDocument(document, word, documentsAvgLength) {
        const K = this.k1 * (1 - this.b + this.b * document.length / documentsAvgLength)
        // 计算单词在该文档的词频
        const tf = document.filter((item) => {
            return item === word
        }).length
        const correlationToDocument = ((this.k1 + 1) * tf) / (K + tf)
        return correlationToDocument
    }

    // 计算单词与query的相关性
    getCorrelationToQuery(word) {
        // 计算单词在query的词频
        const tf = this.query.filter((item) => {
            return item === word
        }).length
        const correlationToQuery = ((this.k3 + 1) * tf) / (this.k3 + tf)
        return correlationToQuery
    }

    // 计算整个query对于某个文档的BM25相关性
    getQueryCorrelationToDocument(document, documentsAvgLength) {
        // query对于某个文档的相关性
        let queryCorrelationToDocument = 0
        this.query.forEach((item) => {
            queryCorrelationToDocument += this.getIDF(item) * this.getCorrelationToDocument(document, item, documentsAvgLength) * this.getCorrelationToQuery(item)
        })
        return queryCorrelationToDocument
    }

    // 得到最终对于所有文档，query的相关性
    getCorrelation() {
        const correlations = []
        // 所有文档的平均长度
        let documentsAvgLength = this.getDocumentAvgLlength()
        this.documents.forEach((document, index) => {
            const correlation = this.getQueryCorrelationToDocument(document, documentsAvgLength)
            correlations.push({ id: index, correlation: correlation })
        })
        return correlations
    }
}
