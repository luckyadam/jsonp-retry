import jsonp from '../index'
import store from '../src/store'

const TEST_URL = '//json.diao.li/getjson/59a5671ee6da184a056ce9ae'
const BACKUP_URL1 = '//json.diao.li/getjson/59a66a9fe6da184a056ce9af'
const BACKUP_URL2 = '//json.diao.li/getjson/59a67cd3e6da184a056ce9b0'
const TIMEOUT_UTL = '//json.diao.li/getjson/59a685ade6da184a056ce9b1'
const STORE_TEST_URL = '//json.diao.li/getjson/59ba2399e6da184a056ce9e2'

describe('jsonp', function () {
  this.timeout(2000000)
  before(() => {
    store.clear()
  })
  after(() => {
    store.clear()
  })
  describe('use callback', () => {
    before(() => {
      jsonp.promiseClose = true
    })
    it('called with url is null', () => {
      jsonp(null, {}, function (err) {
        expect(err).to.exist
          .and.be.instanceof(Error)
          .and.have.property('message', 'Param url is needed!')
      })
    })

    it('called with url is null && opts', () => {
      jsonp(null, function (err) {
        expect(err).to.exist
          .and.be.instanceof(Error)
          .and.have.property('message', 'Param url is needed!')
      })
    })

    it('called with no url && opts', () => {
      jsonp(function (err) {
        expect(err).to.exist
          .and.be.instanceof(Error)
          .and.have.property('message', 'Param url is needed!')
      })
    })

    it('called with no url && opts', () => {
      jsonp(function (err) {
        expect(err).to.exist
          .and.be.instanceof(Error)
          .and.have.property('message', 'Param url is needed!')
      })
    })

    it('called with no url', () => {
      jsonp({
        params: {
          test: 1
        }
      }, function (err) {
        expect(err).to.exist
          .and.be.instanceof(Error)
          .and.have.property('message', 'Param url is needed!')
      })
    })

    it('basic support with callback', (done) => {
      jsonp(TEST_URL, function (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.deep.nested.property('code', 0)
        expect(data).to.have.deep.nested.property('data.count', 10)
        expect(data).to.have.deep.nested.property('data.arr', [1, 2, 3])
        done()
      })
    })

    it('basic support with callback', (done) => {
      jsonp({
        url: TEST_URL
      }, function (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.deep.nested.property('code', 0)
        expect(data).to.have.deep.nested.property('data.count', 10)
        expect(data).to.have.deep.nested.property('data.arr', [1, 2, 3])
        done()
      })
    })

    it('custom callback name', (done) => {
      jsonp(TEST_URL, {
        name: 'customJsonpCallback'
      }, function (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.deep.nested.property('code', 0)
        expect(data).to.have.deep.nested.property('data.count', 10)
        expect(data).to.have.deep.nested.property('data.arr', [1, 2, 3])
        done()
      })
    })

    it('will not use backup string if has url', (done) => {
      jsonp(TEST_URL, {
        backup: BACKUP_URL1
      }, function (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.deep.nested.property('code', 0)
        expect(data).to.have.deep.nested.property('data.count', 10)
        expect(data).to.have.deep.nested.property('data.arr', [1, 2, 3])
        done()
      })
    })

    it('will use backup string if url data check fail', (done) => {
      jsonp(TEST_URL, {
        backup: BACKUP_URL1,
        dataCheck (data) {
          if (data.code === 0) {
            return false
          }
          return true
        }
      }, function (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.deep.nested.property('code', 1)
        expect(data).to.have.deep.nested.property('data.count', 1)
        expect(data).to.have.deep.nested.property('data.arr', [1])
        done()
      })
    })

    it('will not use backup array if has url', (done) => {
      jsonp(TEST_URL, {
        backup: [BACKUP_URL1, BACKUP_URL2],
        dataCheck (data) {
          if (data.name !== 'backup2') {
            return false
          }
          return true
        }
      }, function (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.deep.nested.property('code', 1)
        expect(data).to.have.deep.nested.property('name', 'backup2')
        expect(data).to.have.deep.nested.property('data.count', 1)
        expect(data).to.have.deep.nested.property('data.arr', [1])
        done()
      })
    })

    it('timeout', (done) => {
      jsonp(TIMEOUT_UTL, {
        timeout: 1000
      }, function (err, data) {
        expect(err).to.exist
          .and.be.instanceof(Error)
          .and.have.property('message', 'Timeout and no data return')
        done()
      })
    })

    it('will retry when timeout', (done) => {
      jsonp(TIMEOUT_UTL, {
        timeout: 1000,
        retryTimes: 1,
        backup: BACKUP_URL1
      }, function (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.deep.nested.property('code', 1)
        expect(data).to.have.deep.nested.property('data.count', 1)
        expect(data).to.have.deep.nested.property('data.arr', [1])
        done()
      })
    })

    it('use store if storeSign is correct', (done) => {
      store.clear()
      store.set(`${STORE_TEST_URL}?`, {
        'code': 1,
        'version': 'yyyyy',
        'data': {
          'count': 10,
          'arr': [1]
        }
      })
      jsonp(STORE_TEST_URL, {
        timeout: 1000,
        useStore: true,
        storeCheckKey: 'version',
        storeSign: 'yyyyy'
      }, function (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.deep.nested.property('code', 1)
        expect(data).to.have.deep.nested.property('version', 'yyyyy')
        expect(data).to.have.deep.nested.property('data.arr', [1])
        done()
      })
    })

    it('not use store if storeSign is not correct', (done) => {
      store.clear()
      store.set(`${STORE_TEST_URL}?`, {
        'code': 1,
        'version': 'yyyyy',
        'data': {
          'count': 10,
          'arr': [1]
        }
      })
      jsonp(STORE_TEST_URL, {
        useStore: true,
        storeCheckKey: 'version',
        storeSign: 'hhhh'
      }, function (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.deep.nested.property('code', 0)
        expect(data).to.have.deep.nested.property('version', 'yyyyy')
        expect(data).to.have.deep.nested.property('data.arr', [1, 2, 3])
        done()
      })
    })

    it('not use store if dataCheck fail', (done) => {
      store.clear()
      store.set(`${STORE_TEST_URL}?`, {
        'code': 1,
        'version': 'yyyyy',
        'data': {
          'count': 10,
          'arr': [1]
        }
      })
      jsonp(STORE_TEST_URL, {
        useStore: true,
        storeCheckKey: 'version',
        storeSign: 'yyyyy',
        dataCheck (data) {
          if (data.code !== 0) {
            return false
          }
          return true
        }
      }, function (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.deep.nested.property('code', 0)
        expect(data).to.have.deep.nested.property('version', 'yyyyy')
        expect(data).to.have.deep.nested.property('data.arr', [1, 2, 3])
        done()
      })
    })

    it('will fallback to store backup cannot use', (done) => {
      store.clear()
      store.set(`${STORE_TEST_URL}?`, {
        'code': 10,
        'version': 'yyyyy',
        'data': {
          'count': 10,
          'arr': [1]
        }
      })
      jsonp(STORE_TEST_URL, {
        useStore: true,
        storeCheckKey: 'version',
        storeSign: 'hhhh',
        backup: [BACKUP_URL1, BACKUP_URL2],
        dataCheck (data) {
          if (data.code !== 10) {
            return false
          }
          return true
        }
      }, function (err, data) {
        expect(err).to.not.exist
        expect(data).to.have.deep.nested.property('code', 10)
        expect(data).to.have.deep.nested.property('version', 'yyyyy')
        expect(data).to.have.deep.nested.property('data.arr', [1])
        done()
      })
    })

    it('store data can not pass dataCheck', (done) => {
      store.clear()
      store.set(`${STORE_TEST_URL}?`, {
        'code': 1,
        'version': 'yyyyy',
        'data': {
          'count': 10,
          'arr': [1]
        }
      })
      jsonp(STORE_TEST_URL, {
        useStore: true,
        backup: [BACKUP_URL1, BACKUP_URL2],
        dataCheck (data) {
          if (data.code !== 10) {
            return false
          }
          return true
        }
      }, function (err, data) {
        expect(err).to.exist
          .and.be.instanceof(Error)
          .and.have.property('message', 'Data check error, and no fallback')
        done()
      })
    })

    it('will set data to store if data is correct', (done) => {
      store.clear()
      jsonp(STORE_TEST_URL, {
        useStore: true,
        backup: [BACKUP_URL1, BACKUP_URL2],
        dataCheck (data) {
          if (data.code !== 0) {
            return false
          }
          return true
        }
      }, function (err, data) {
        data = store.get(`${STORE_TEST_URL}?`)
        expect(err).to.not.exist
        expect(data).to.have.deep.nested.property('code', 0)
        expect(data).to.have.deep.nested.property('version', 'yyyyy')
        expect(data).to.have.deep.nested.property('data.arr', [1, 2, 3])
        done()
      })
    })
  })

  describe('promisify', () => {
    before(() => {
      jsonp.promiseClose = false
      delete jsonp.promiseClose
    })
    it('url err', () => {
      return jsonp(null, {}).then(data => {

      }).catch(err => {
        expect(err).to.exist
          .and.be.instanceof(Error)
          .and.have.property('message', 'Param url is needed!')
      })
    })
    it('from store', () => {
      store.set(`${STORE_TEST_URL}?`, {
        'code': 1,
        'version': 'yyyyy',
        'data': {
          'count': 10,
          'arr': [1]
        }
      })
      return jsonp(STORE_TEST_URL, {
        useStore: true,
        storeCheckKey: 'version',
        storeSign: 'yyyyy',
        backup: [BACKUP_URL1, BACKUP_URL2]
      }).then(data => {
        expect(data).to.have.deep.nested.property('code', 1)
        expect(data).to.have.deep.nested.property('version', 'yyyyy')
        expect(data).to.have.deep.nested.property('data.arr', [1])
      })
    })

    it('from network', () => {
      store.clear()
      return jsonp(STORE_TEST_URL, {
        useStore: true,
        backup: [BACKUP_URL1, BACKUP_URL2],
        dataCheck (data) {
          if (data.code !== 0) {
            return false
          }
          return true
        }
      }).then(data => {
        expect(data).to.have.deep.nested.property('code', 0)
        expect(data).to.have.deep.nested.property('version', 'yyyyy')
        expect(data).to.have.deep.nested.property('data.arr', [1, 2, 3])
      })
    })
  })
})
