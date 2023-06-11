const BM25 = require('./index.js')

const test = new BM25(1.2, 1.2, 0.75)

const corpus = [
    ['black', 'cat', 'white', 'cat'],
    ['cat', 'outer', 'space'],
    ['wag', 'dog'],
    ['black', 'cat', 'dog', 'outer']
]

const query = ['black', 'cat', 'dog', 'outer', 'space']

test.setDocuments(corpus)
test.setQuery(query)

const result = test.getCorrelation()
console.log(result)
