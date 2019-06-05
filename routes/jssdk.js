const router = require('koa-router')()
const jssdk = require('../faya/index.js')
const mppay = require('../faya/pay.js')
//router.prefix('/jssdk')

//post 请求的请求jssdk授权相关
router.post('/jssdk/api', async (ctx, next)=> {
	let res = await ctx.request.body;
  	ctx.body = {
  		resCode: 0,
  		obj: await jssdk(res),
  		msg: ''
  	}
})

//get 请求的请求jssdk授权相关
router.get('/jssdk/api', async (ctx, next)=> {
	let res  = await ctx.request.query;
  	ctx.body = {
  		resCode: 0,
  		obj: await jssdk(res),
  		msg: ''
  	}
})

//get 请求的请求小程序支付授权相关
router.get('/mporg/pay', async (ctx, next)=> {
	let  res  = await ctx.request.query;
	ctx.body = {
		resCode: 0,
		obj: await mppay(res),
		msg: ''
	}
})



module.exports = router
