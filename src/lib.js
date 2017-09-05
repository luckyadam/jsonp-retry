const enc = encodeURIComponent

export function serializeParams (params) {
  if (!params) {
    return ''
  }
  return Object.keys(params)
    .map(item => (`${item}=${enc(params[item])}`)).join('&')
}

export function isFunction (fn) {
  return typeof fn === 'function'
}
