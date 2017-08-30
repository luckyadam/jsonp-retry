const enc = encodeURIComponent

export function serializeParams (params) {
  let str = ''
  if (!params) {
    return str
  }
  for (const key in params) {
    let val = params[key]
    if (typeof val === 'function') {
      val = val()
    }
    str += `${enc(key)}=${enc(val)}&`
  }
  return str.substr(0, str.length - 1)
}
