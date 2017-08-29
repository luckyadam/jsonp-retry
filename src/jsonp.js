import { isNative, serializeParams } from './lib'
import assign from 'object-assign'

const win = window

const noop = function () {}

const canUsePromise = (function () {
  return 'Promise' in win && isNative(Promise)
})()

const encodeC = encodeURIComponent
const doc = document

const defaultConfig = {
  timeout: 2000,
  retryTimes: 2,
  backup: null,
  params: {},
  jsonp: 'callback',
  jsonpCallback: null,
  needStore: false,
  cache: true,
  storeSign: null,
  dataCheck: null,
  scriptCharset: 'UTF-8'
}

function jsonp (url, opts, cb) {
  if (!url && (opts == null || typeof opts !== 'object' || typeof opts.url !== 'string')) {
    return cb(new Error('Param url is needed!'))
  }
  if (typeof url === 'object' && (url == null || typeof url.url !== 'string')) {
    return cb(new Error('Param url is needed!'))
  }
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (!opts) {
    opts = {}
  }
  opts = assign({}, defaultConfig, opts)
  const backup = opts.backup
  const charset = opts.scriptCharset
  const funcId = opts.jsonpCallback || `__jsonp${new Date().getTime()}`
  url = url || opts.url
  let params = serializeParams(opts.params)
  if (params) {
    params = `&${params}`
  }
  url += (~url.indexOf('?') ? '&' : '?') + `${opts.jsonp}=${encodeC(funcId)}${params}`
  url = url.replace('?&', '?')
  win[funcId] = function (data) {
    if (opts.dataCheck) {
      if (opts.dataCheck(data)) {
        cb(null, data)
      }
      return
    }
    cb(null, data)
  }
  appendScriptTagToHead({
    url,
    charset
  })
}

function appendScriptTagToHead ({ url, charset }) {
  const head = doc.head || doc.getElementsByTagName('head')[0]
  const script = doc.createElement('script')
  script.type = 'text/javascript'
  if (charset) {
    script.charset = charset
  }
  script.src = url
  head.appendChild(script)
  return script
}

export default jsonp
