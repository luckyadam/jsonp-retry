import jsonp from '../index'

const TEST_URL = 'http://json.diao.li/getjson/59a5671ee6da184a056ce9ae'
const BACKUP_URL1 = 'http://json.diao.li/getjson/59a66a9fe6da184a056ce9af'
const BACKUP_URL2 = 'http://json.diao.li/getjson/59a67cd3e6da184a056ce9b0'
const TIMEOUT_UTL = 'http://json.diao.li/getjson/59a685ade6da184a056ce9b1'

describe('test jsonp', function () {
  this.timeout(2000000)

  it('test jsonp called with no url && backup param', () => {
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

  it('test basic jsonp support with callback', (done) => {
    jsonp(TEST_URL, function (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.deep.nested.property('code', 0)
      expect(data).to.have.deep.nested.property('data.count', 10)
      expect(data).to.have.deep.nested.property('data.arr', [1, 2, 3])
      done()
    })
  })

  it('test basic jsonp support with callback', (done) => {
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

  it('test custom jsonp callback name', (done) => {
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

  it('test jsonp use backup string if no url param', (done) => {
    jsonp({
      backup: BACKUP_URL2
    }, function (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.deep.nested.property('code', 1)
      expect(data).to.have.deep.nested.property('name', 'backup2')
      expect(data).to.have.deep.nested.property('data.count', 1)
      expect(data).to.have.deep.nested.property('data.arr', [1])
      done()
    })
  })

  it('test jsonp will not use backup string if has url', (done) => {
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

  it('test jsonp will use backup string if url data check fail', (done) => {
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

  it('test jsonp will not use backup array if has url', (done) => {
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

  it('test jsonp timeout', (done) => {
    jsonp(TIMEOUT_UTL, {
      timeout: 1000
    }, function (err, data) {
      expect(err).to.exist
        .and.be.instanceof(Error)
        .and.have.property('message', 'Timeout and no data return')
      done()
    })
  })

  it('test jsonp will retry when timeout', (done) => {
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
})
