let VERSION = '3.0'
console.log(`self`, self)

// 首次安装 基本上只调一次
self.addEventListener('install', e => {
	// 这个event是ExtendableEvent
	console.log('install')
	console.log(`e instanceof ExtendableEvent`, e instanceof ExtendableEvent)
	//? 不知道waitUntil有什么卵用-_-|||
	//! 事件可以继续传递下去
	//! promise成功才可以执行
	// e.waitUntil(
	// 	caches.open(VERSION).then(cache => {
	// 		return cache.addAll([
	// 			'//dev_static.qdtech.ai/static/tools/js/selfSurvey.js',
	// 			'//dev_static.qdtech.ai/static/tools/js/answer_1.js',
	// 			'//dev_static.qdtech.ai/static/tools/js/answer_2.js'
	// 		])
	// 	})
	// )
	// 直接跳过 到激活
	// 如果不这样做 更改版本号再进入时不会activate
	self.skipWaiting()
})

// 激活 一般做缓存更新的操作
self.addEventListener('activate', e => {
	console.log('activate')
	console.log(`e instanceof ExtendableEvent`, e instanceof ExtendableEvent)
	let cacheKeys = caches.keys()
	console.log('cacheKeys', cacheKeys)
	e.waitUntil(
		caches.open(VERSION).then(cache => {
			let cacheFiles = cache.addAll([
				'index.html',
				'version.js'
			])
			console.log(`cacheFiles`, cacheFiles)
			return cacheFiles
		})
	)
	e.waitUntil(
		caches.keys().catch(e => console.error(e))
			.then(cacheNames => {
				return Promise.all(cacheNames.map(name => {
					if (name !== VERSION) {
						return caches.delete(name)
					}
				}))
			})
	)
})

// 捕获请求并返回缓存数据
self.addEventListener('fetch', e => {
	console.log(`fetch`)
	console.log(`e instanceof FetchEvent`, e instanceof FetchEvent, e.__proto__)
	e.respondWith(
		caches.match(e.request).catch(e => {
				console.error('fetch error', e)
				let fetch = fetch(e.request)
				console.log('fetch(e.request)', fetch)
				return fetch
			})
			.then(res => {
				// if (!res) {
				// 	return res
				// }
				// caches.open(VERSION).then(cache => {
				// 	cache.put(e.request, res)
				// })
				// return res.clone()
				console.log(`res instanceof Response`, res instanceof Response, res, res.__proto__)
				if (res) {
					console.log(`使用缓存`, e.request, res)
					return res
				} else {
					console.log(`使用http`, e.request)
					return fetch(e.request.url)
				}
			})
			.catch(e => {
				let png404 = caches.match('./404.png')
				console.error('fetch error', e)
				console.log('404', png404)
				return png404
			})
	)
})

