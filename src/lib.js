const enc = encodeURIComponent

export function isNative (Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

export function serializeParams (params) {
  let str = ''
  if (!params) {
    return str
  }
  for (let key in params) {
    let val = params[key]
    if (typeof val === 'function') {
      val = val()
    }
    str += `${encodeURIComponent(key)}=${encodeURIComponent(val)}&`
  }
  return str.substr(0, str.length - 1)
}
