import jsonp from '../src/jsonp'

describe('test jsonp', () => {
  it('test jsonp called with no url param', () => {
    jsonp(null, {}, function (err) {
      expect(err).to.exist
        .and.be.instanceof(Error)
        .and.have.property('message', 'Param url is needed!')
    })
  })

  it('test basic jsonp support with callback', () => {
    jsonp('http://json.diao.li/getjson/59a5671ee6da184a056ce9ae', function (err, data) {
      expect(data).to.have.deep.nested.property('code', 0)
      expect(data).to.have.deep.nested.property('data.count', 10)
      expect(data).to.have.deep.nested.property('data.arr', [1, 2, 3])
    })
  })
})
