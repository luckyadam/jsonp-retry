import { isNative, serializeParams } from './lib'
import assign from 'object-assign'

const win = window

const noop = function () {}

const canUsePromise = (function () {
  return 'Promise' in win && isNative(Promise)
})()

const encodeC = encodeURIComponent
const doc = document
const head = doc.head || doc.getElementsByTagName('head')[0]

const TIMEOUT_CONST = 2000

const defaultConfig = {
  timeout: TIMEOUT_CONST,
  retryTimes: 2,
  backup: null,
  params: {},
  jsonp: 'callback',
  name: null,
  needStore: false,
  cache: true,
  storeSign: null,
  dataCheck: null,
  scriptCharset: 'UTF-8'
}

let timer
let script

function jsonp (url, opts, cb) {
  if (typeof url === 'function') {
    cb = url
    opts = {}
  } else if (url && typeof url === 'object') {
    cb = opts
    opts = url || {}
    url = opts.url
  }
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (!opts) {
    opts = {}
  }
  opts = assign({}, defaultConfig, opts)
  url = url || opts.url
  fetchData(url, opts, cb)
}

function fetchData (url, opts, cb) {
  if (!url || typeof url !== 'string') {
    if (false === fallback(opts, cb)) {
      return cb(new Error('Param url is needed!'))
    }
    return
  }
  const charset = opts.scriptCharset
  const funcId = opts.name || `__jsonp${new Date().getTime()}`
  let params = serializeParams(opts.params)
  if (params) {
    params = `&${params}`
  }
  url += (~url.indexOf('?') ? '&' : '?') + `${opts.jsonp}=${encodeC(funcId)}${params}`
  url = url.replace('?&', '?')
  const timeout = opts.timeout != null ? opts.timeout : TIMEOUT_CONST

  // when timeout, will try to retry
  timer = setTimeout(() => {
    cleanup(funcId)
    // no retryTimes left, go to backup
    if (typeof opts.retryTimes === 'number' && opts.retryTimes > 0) {
      opts.retryTimes--
      return fetchData(url, opts, cb)
    }
    if (false === fallback(opts, cb)) {
      return cb(new Error('Timeout and no data return'))
    }
  }, timeout)

  win[funcId] = function (data) {
    cleanup(funcId)
    if (opts.dataCheck) {
      if (opts.dataCheck(data)) {
        return cb(null, data)
      }
      const backup = opts.backup
      if (false === fallback(opts, cb)) {
        cb(new Error('Data check error, and no fallback'))
      }
    } else {
      cb(null, data)
    }
  }
  appendScriptTagToHead({
    url,
    charset
  })
}

function fallback (opts, cb) {
  const backup = opts.backup
  if (backup) {
    if (Array.isArray(backup) && backup.length) {
      return fetchData(backup.shift(), opts, cb)
    }
    delete opts.backup
    return fetchData(backup, opts, cb)
  }
  return false
}

function cleanup (funcId) {
  if (script.parentNode) {
    script.parentNode.removeChild(script)
  }
  win[funcId] = noop
  if (timer) {
    clearTimeout(timer)
  }
}

export function appendScriptTagToHead ({ url, charset }) {
  script = doc.createElement('script')
  script.type = 'text/javascript'
  if (charset) {
    script.charset = charset
  }
  script.src = url
  head.appendChild(script)
}

export default jsonp
