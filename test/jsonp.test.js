import jsonp from '../src/jsonp'

const TEST_URL = 'http://json.diao.li/getjson/59a5671ee6da184a056ce9ae'

describe('test jsonp', () => {
  it('test jsonp called with no url param', () => {
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

  it('test basic jsonp support with callback', () => {
    jsonp(TEST_URL, function (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.deep.nested.property('code', 0)
      expect(data).to.have.deep.nested.property('data.count', 10)
      expect(data).to.have.deep.nested.property('data.arr', [1, 2, 3])
    })

    jsonp({
      url: TEST_URL
    }, function (err, data) {
      expect(err).to.not.exist
      expect(data).to.have.deep.nested.property('code', 0)
      expect(data).to.have.deep.nested.property('data.count', 10)
      expect(data).to.have.deep.nested.property('data.arr', [1, 2, 3])
    })
  })
})
