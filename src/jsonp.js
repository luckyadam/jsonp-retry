import { isNative, serializeParams } from './util'
import assign from 'object-assign'

const noop = function () {}

const canUsePromise = (function () {
  return 'Promise' in window && isNative(Promise)
})()

const enc = encodeURIComponent
const doc = document

const defaultConfig = {
  timeout: 2000,
  retryTimes: 2,
  backup: null,
  params: { },
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
    throw new Error('Param url is needed!')
  }
  if (typeof url === 'object' && (url == null || typeof url.url !== 'string')) {
    throw new Error('Param url is needed!')
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
  const charset = opts.charset
  const funcId = opts.jsonpCallback || `__jsonp${new Date().getTime()}`
  let url = url || opts.url
  const params = serializeParams(opts.params)
  url += (~url.indexOf('?') ? '&' : '?') + `${opts.jsonp}=${enc(funcId)}&${params}`
  url = url.replace('?&', '?')
  window[funcId] = function (data) {
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
  const script = node = doc.createElement('script')
  script.type = 'text/javascript'
  if (charset) {
    script.charset = charset
  }
  script.src = url
  head.insertBefore(script, head.firstChild)
  return script
}
