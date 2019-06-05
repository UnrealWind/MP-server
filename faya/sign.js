// 随机字符串
// let jsSHA = require("jssha");
let crypto = require('crypto'); // hash加密

let createNonceStr = ()=> {
  return Math.random().toString(36).substr(2, 15);
};

// 时间戳
let createTimestamp = ()=> {
  return parseInt(new Date().getTime() / 1000) + '';
};

// 排序拼接
let raw =  (args)=> {
  let keys = Object.keys(args);
  keys = keys.sort()
  let newArgs = {};
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key];
  });
  let string = '';
  for (let k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
};

/**
* @synopsis 签名算法
*
* @param jsapi_ticket 用于签名的 jsapi_ticket
* @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
*
* @returns
*/
let sign = (jsapi_ticket, url)=> {
  let ret = {
    jsapi_ticket: jsapi_ticket,
    nonceStr: createNonceStr(),
    timestamp: createTimestamp(),
    url: url
  };
  let string = raw(ret);
  let shasum = crypto.createHash('sha1');
      shasum.update(string);

  let signature = shasum.digest("hex");
  ret.signature = signature;
  return ret;
};

module.exports = sign;
