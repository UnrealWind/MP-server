let md5 = require('md5-node')	// 引入md5加密模块
let xml2js = require('xml2js')	// 引入xml解析模块
let sign = require('./sign.js'); //引入前面计算逻辑

const appid = 'wx3383a60043c76e70' // 自行更换成自己的appid
const appSecret = '490dbb8c01fd1279e16293dc2431c9e3' // 自行更换成自己的appSecret
let mch_id = '1484310612'	// 自己的商户号id

let time = new Date().getTime()	// 商户订单号
let nonce_str = createNonceStr() //获取随机数字符串

let total_fee
let request = require('request')

module.exports = (req) => {
  total_fee = Number(req['money']) * 100
  return new Promise((resolve, reject) => {
    getOpenid(req.code, appid).then(function (openid) {
      let sign = createSign({
        appid: appid,
        body: '微信支付，商品详细描述',
        mch_id: mch_id,
        nonce_str: nonce_str,
        notify_url: 'mini.mokekeji.com:12139/accept', // 异步接收微信支付结果通知的回调地址，通知url必须为外网可访问的url，不能携带参数。现在先预留一下这个接口
        openid: openid,
        out_trade_no: time,
        spbill_create_ip: '60.205.165.89',
        total_fee: total_fee,
        trade_type: 'JSAPI'
      })
      let reqUrl = 'https://api.mch.weixin.qq.com/pay/unifiedorder'
      let formData =
          `<xml>
            <appid>${appid}</appid>
            <mch_id>${mch_id}</mch_id>
            <nonce_str>${nonce_str}</nonce_str>
            <sign>${sign}</sign>
            <body>微信支付，商品详细描述</body>
            <out_trade_no>${time}</out_trade_no>
            <total_fee>${total_fee}</total_fee>
            <spbill_create_ip>60.205.165.89</spbill_create_ip>
            <notify_url>mini.mokekeji.com:12139/accept</notify_url>
            <trade_type>JSAPI</trade_type>
            <openid>${openid}</openid>
        </xml>`

      // 发起请求，获取微信支付的一些必要信息
      request({
        url: reqUrl,
        method: 'POST',
        json: true,
        headers: {
          'content-type': 'application/json'
        },
        body: formData
      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          xml2js.parseString(body, function (error, result) {
              let reData = result.xml
              let timeStamp = new Date().getTime()
              let responseData = {
                  timeStamp: timeStamp,
                  nonceStr: nonce_str,
                  package: reData.prepay_id[0],
                  //这里需要注意的是，这里的nonce_str 仍然要使用之前的，不能使用他返回来的
                  paySign: createPaySign({
                      appid: appid,
                      nonce_str: nonce_str,
                      prepay_id:reData.prepay_id[0],
                      timeStamp:timeStamp
                  })
              }
              resolve(responseData)
          })
        }
      })
    })
  })
}

// 发起请求获取用户的openID
function getOpenid (code, appid) {
  return new Promise(function (resolve, reject) {
    request('https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + appSecret + '&js_code=' + code + '&grant_type=authorization_code', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var bodyJson = JSON.parse(body)
        resolve(bodyJson.openid)
      }
    })
  })
}

// 签名算法（把所有的非空的参数，按字典顺序组合起来+key,然后md5加密，再把加密结果都转成大写的即可）
function createSign (obj) {
  var stringA = 'appid=' + obj.appid + '&body=' + obj.body + '&mch_id=' + obj.mch_id + '&nonce_str=' + obj.nonce_str + '&notify_url=' + obj.notify_url + '&openid=' + obj.openid + '&out_trade_no=' + obj.out_trade_no + '&spbill_create_ip=' + obj.spbill_create_ip + '&total_fee=' + obj.total_fee + '&trade_type=' + obj.trade_type
  var stringSignTemp = stringA + '&key=a38a9caa766a379b84d473edeb2460be'
  stringSignTemp = md5(stringSignTemp)
  var signValue = stringSignTemp.toUpperCase()
  return signValue
}

//小程序支付二次签名
function createPaySign (obj) {
	var stringA = 'appId=' + obj.appid + '&nonceStr=' + obj.nonce_str + '&package=prepay_id=' + obj.prepay_id + '&signType=MD5&timeStamp='+ obj.timeStamp
	var stringSignTemp = stringA + '&key=a38a9caa766a379b84d473edeb2460be'
	        console.log(stringSignTemp)
	  stringSignTemp = md5(stringSignTemp)
	  var signValue = stringSignTemp.toUpperCase()
	  return signValue
}
