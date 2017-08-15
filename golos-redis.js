require('events').EventEmitter.prototype._maxListeners = 100000;
const Promise = require("bluebird")
const _ = require('lodash')
const golos = require("golos-js")
const redis = require("redis")
const client = redis.createClient()
golos.config.set('websocket','ws://localhost:9090')
golos.config.set('address_prefix','GLS')
golos.config.set('chain_id','782a3039b478c839e4cb0c941ff4eaeb7df40bdd68bd441afd444b9da763de12')
let trig = {existBlock:true}
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
    golos.api.getBlock(currentblock, (err, result) => {if (err) {console.log(err) } else if (result === null){trig.existBlock = false}else {
		let JSONblock = JSON.stringify(result)
		client.hmset("GolosLastBlock", "data",JSONblock);
		console.log(JSONblock)
			}
	})
}
const NEXTBLOCKS = firstblock => {
    let currentblock = firstblock
    setInterval(() => {
if(trig.existBlock){
					currentblock++
				}else{console.warn(`Проблема блока ${currentblock}`)}
		SENDBLOCK(currentblock)
    }, 3000)
}
dynamicSnap
    .then(FIRSTBLOCK)
    .then(NEXTBLOCKS)
    .catch(e => console.log(e));
	
	
