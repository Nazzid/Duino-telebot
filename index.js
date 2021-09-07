const TeleBot = require('telebot');
const dotenv = require("dotenv");
const cheerio = require("cheerio");
dotenv.config();
const TOKEN = "";
const bot = new TeleBot(TOKEN);

//Module
const axios = require('axios')

bot.on("/start", (msg) => {
    bot.sendMessage(msg.chat.id, `Bot Duino Coin`)
})

bot.on("/user", async (msg) => {
    let text = msg.text;
	username = text.split(" ")[1]
	if(!username) return bot.sendMessage(msg.from.id, `/user username\n\nUsername Required!`, { replyToMessage: msg.message_id })
    
	wallet = await getJSON(`https://server.duinocoin.com/users/${username}`)
	if(wallet.success == false) return bot.sendMessage(msg.from.id, `User not Found`, { replyToMessage: msg.message_id })
	
	// Wallet
	wallet = wallet.result
	w_username = wallet.balance.username
	w_verified	   = wallet.balance.verified
	w_balance    = parseFloat(wallet.balance.balance).toFixed(4)
	w_worker	   = wallet.miners
	
	if(w_verified == "yes"){
		verified = "Verified"
	}else{
		verified = "Unverified"
	}

	worker = {}
	worker.esp32 = 0
	worker.esp8266 = 0
	worker.arduino = 0
	worker.else = 0
	
	w_worker.map(async(v, i)=>{
		software = v.software.toLowerCase()
		if(/(esp32)/.test(software)){
			worker.esp32 = worker.esp32 + 1
		}else if(/(esp8266)/.test(software)){
			worker.esp8266 = worker.esp8266 + 1
		}else if(/(avr)/.test(software)){
			worker.arduino = worker.arduino + 1
		}else{
			worker.else = worker.else + 1
		}
	})
	
	price = await getJSON(`https://server.duinocoin.com/api.json`)
	p_price = price['Duco price']
	text = `<b>ᕲ DuinoCoin</b>
<b>ID</b> : ${w_username} [${verified}]
<b>Balance</b> : ${w_balance}
<b>Price</b> : $ ${p_price}
<b>Worker (${w_worker.length})</b> : ${JSON.stringify(worker, null, "\t")}`
	bot.sendMessage(msg.from.id, text, { replyToMessage: msg.message_id, parseMode: 'html' })
});

bot.on("/help", (msg) => {
    bot.sendMessage(msg.chat.id, `List Command : 
/user`)
})

bot.on("/news", async (msg) => {
	news = await getJSON(`https://server.duinocoin.com/news.html`)
	const $ = cheerio.load(news)
	list = []
	$('span[class="has-text-weight-normal"]').each((i,e)=>{
		console.log(e.children().remove().end().text())
	})
	
	//bot.sendMessage(msg.from.id, news, { replyToMessage: msg.message_id, parseMode: 'html' })
})

bot.start();

const getJSON = async(url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options
        })
        return res.data
    } catch (e) {
        console.log(`Error : ${e}`)
    }
}