require('events').EventEmitter.prototype._maxListeners = 10000;
const Promise = require("bluebird")
const _ = require('lodash')
const golos = require("golos-js")
const redis = require("redis")
const client = redis.createClient()
//golos.config.set('websocket','wss://ws.golos.io')
golos.config.set('websocket','ws://localhost:9090');
golos.config.set('address_prefix','GLS')
golos.config.set('chain_id','782a3039b478c839e4cb0c941ff4eaeb7df40bdd68bd441afd444b9da763de12')
let fixBlock = true
let isNext = 0;
let EmptyJson = JSON.stringify({"timestamp":"0000-00-00T00:00:00"})
				
const dynamicSnap = new Promise((resolve, reject) => {
    golos.api.getDynamicGlobalProperties((err, res) => {
        if (err) {console.log(err)}
        else {
            resolve(res)
        }
    })
})
const FIRSTBLOCK = n => n.head_block_number
const SENDBLOCK = currentblock => {
    golos.api.getBlock(currentblock, (err, result) => {
		
		if (err || result === null) {
			console.warn(err) 
			client.hmset("GolosLastBlock", "data",EmptyJson);
			fixBlock = false
			}
			else
			{
				
		       if(result.previous !== isNext){
				   let JSONblock = JSON.stringify(result)
		console.log(`========================${result.timestamp}=========================
${JSONblock}`)
		fixBlock = true
		isNext = result.previous
		return client.hmset("GolosLastBlock", "data",JSONblock);
			   }else{
				   console.warn(`ОШИБКА result.previus ${result.previous}`)
			   }

		
		}
	})
}
const NEXTBLOCKS = firstblock => {
    let currentblock = firstblock 
	
    setInterval(() => {
if(fixBlock){
					currentblock++
				}else{
					console.warn(`Проблема блока ${currentblock}`)
					client.hmset("GolosLastBlock", "data",EmptyJson);
				}
		SENDBLOCK(currentblock)

    }, 3000);
	
}

dynamicSnap.then(FIRSTBLOCK).then(NEXTBLOCKS).catch(e => console.log(e));
	
	
