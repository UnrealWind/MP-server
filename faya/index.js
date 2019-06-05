let sign = require('./sign.js'); //引入前面计算逻辑
const appid = "wxed9d0d46408f0038"; // 自行更换成自己的appid
const appSecret = "8cbedc8f81e85a26c992840dd6d744dd";// 自行更换成自己的appSecret
let fly=require("flyio")

// 获取access_token
let getAccessToken = ()=> {
	return new Promise((resolve, reject)=> {
		let url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appid+'&secret='+appSecret;
		fly.get(url).then(res=> {
			resolve({
				access_token: res.data.access_token,
				expires_in: res.data.expires_in
			})
		}).catch(error=> {
			console.log(error)
		})
	})
}

// 获取jsapi_ticket
let getJsapiTicket = ()=> {
	return new Promise((resolve, reject)=> {
		getAccessToken().then(res=> {
			let {access_token, expires_in} = res;
			let ticketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + access_token + '&type=jsapi';
			fly.get(ticketUrl).then(params=> {
				let ticket = '';
				if (params.data.errmsg == 'ok') {
					ticket = params.data;
					resolve(ticket)
				} else {
					reject()
				}
			}).catch(error=> {
				console.log(error)
			})
		})
	})
}

// 计算signature
let getSignature = (url)=> {
	return new Promise((resolve, reject)=>{
		getJsapiTicket().then(res=> {
			let ticket = res.ticket;
			let getSign = sign(ticket, url);
			resolve(getSign);
		})
	})
}

// var signatureStr = sign(content.ticket, req.body.url);
module.exports = (res)=> {
	return new Promise((resolve, reject)=> {
		let url = res.url
		getSignature(url).then(res=> {
			resolve({
				appid,
			    jsapi_ticket: res.jsapi_ticket,
			    noncestr: res.nonceStr,
			    sign: res.signature,
			    timestamp: res.timestamp,
			})
		})
	})
}


