import jsonp from '../index'
import store from '../src/store'

const TEST_URL = '//json.diao.li/getjson/59a5671ee6da184a056ce9ae'
const BACKUP_URL1 = '//json.diao.li/getjson/59a66a9fe6da184a056ce9af'
const BACKUP_URL2 = '//json.diao.li/getjson/59a67cd3e6da184a056ce9b0'
const TIMEOUT_UTL = '//json.diao.li/getjson/59a685ade6da184a056ce9b1'
const STORE_TEST_URL = '//json.diao.li/getjson/59a6b863e6da184a056ce9b2'

describe('jsonp', function () {
  this.timeout(2000000)
  before(() => {
    store.clear()
  })
  after(() => {
    store.clear()
  })
  it('jsonp called with no url && backup param', () => {
    jsonp(null, {}, function (err) {
      expect(err).to.exist
        .and.be.instanceof(Error)
        .and.have.property('message', 'Param url is needed!')
    })

    jsonp(null, function (err) {
      expect(err).to.exist
        .and.be.instanceof(Error)
        .and.have.property('message', 'Param url is needed!')
    })

    jsonp(function (err) {
      expect(err).to.exist
        .and.be.instanceof(Error)
        .and.have.property('message', 'Param url is needed!')
    })

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

  it('basic jsonp support with callback', (done) => {
    jsonp(TEST_URL, function (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.deep.nested.property('code', 0)
      expect(data).to.have.deep.nested.property('data.count', 10)
      expect(data).to.have.deep.nested.property('data.arr', [1, 2, 3])
      done()
    })
  })

  it('basic jsonp support with callback', (done) => {
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

  it('custom jsonp callback name', (done) => {
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

  it('jsonp will not use backup string if has url', (done) => {
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

  it('jsonp will use backup string if url data check fail', (done) => {
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

  it('jsonp will not use backup array if has url', (done) => {
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

  it('jsonp timeout', (done) => {
    jsonp(TIMEOUT_UTL, {
      timeout: 1000
    }, function (err, data) {
      expect(err).to.exist
        .and.be.instanceof(Error)
        .and.have.property('message', 'Timeout and no data return')
      done()
    })
  })

  it('jsonp will retry when timeout', (done) => {
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

  it('jsonp use store if storeSign is correct', (done) => {
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

  it('jsonp not use store if storeSign is not correct', (done) => {
    store.set(STORE_TEST_URL, {
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

  it('jsonp not use store if dataCheck fail', (done) => {
    store.set(STORE_TEST_URL, {
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

  it('jsonp will fallback to store backup cannot use', (done) => {
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

  it('jsonp store data can not pass dataCheck', (done) => {
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

  it('jsonp will set data to store if data is correct', (done) => {
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
