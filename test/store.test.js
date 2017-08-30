import store from '../src/store'

describe('store', function () {
  this.timeout(2000000)
  before(() => {
    store.clear()
    store.set('key1', 1)
    store.set('key2', 'sdsd')
    store.set('key3', {
      a: 1,
      b: 2
    })
    store.set('key4', null)
  })
  after(() => {
    store.clear()
  })
  it('set get', () => {
    expect(store.get('key1')).to.be.equal(1)
    expect(store.get('key2')).to.be.equal('sdsd')
    expect(store.get('key3')).to.be.deep.equal({
      a: 1,
      b: 2
    })
    expect(store.get('key4')).to.be.equal(null)
  })

  it('serialize', () => {
    expect(store.serialize(1)).to.be.equal('1')
    expect(store.serialize('key1')).to.be.equal('"key1"')
    expect(store.serialize({ a: 1 })).to.be.equal('{"a":1}')
  })

  it('deserialize', () => {
    expect(store.deserialize(1)).to.be.undefined
    expect(store.deserialize('key1')).to.be.equal('key1')
    expect(store.deserialize('{"a":1}')).to.be.deep.equal({ a: 1 })
  })

  it('has', () => {
    expect(store.has('key4')).to.be.true
    expect(store.has('key1')).to.be.true
    expect(store.has('key5')).to.be.false
  })

  it('getAll', () => {
    expect(store.getAll()).to.have.property('key1', 1)
    expect(store.getAll()).to.have.property('key2', 'sdsd')
    expect(store.getAll()).to.deep.have.property('key3', {
      a: 1,
      b: 2
    })
  })

  it('clear', () => {
    store.clear()
    expect(store.has('key1')).to.be.false
    expect(store.has('key2')).to.be.false
    expect(store.has('key3')).to.be.false
    expect(store.has('key4')).to.be.false
  })
})
