"use strict"
// Copyright 2017 TRI R.A. WIBOWO

function show_error(res, error)
{
    console.log(error.stack)

    res.send(error.stack)
}

function show_result(res, result)
{
    console.log(result)
    res.send(result)
}

function webhook_endpoints(app, db)
{
    // 1. Webhook for Telegram
    function telegram_callback(req, res)
    {
        console.log(req.body.message.text)
        res.send(req.body.message.text)
    }

    app.post(`/bots/telegram/notifications`, telegram_callback)
    
    // 2. Webhook for LINE
    function line_callback(req, res)
    {
        // Tri's user ID : U035d6dacdb93f22e4445ae73eef4ff44
        /* {
	"replyToken" : "5cb59456d66c48de8d1792df83862c53",
	"messages" : [
		{
			"type" : "text",
			"text" : "Kamu ganteng deh <3"
		}
	]
}
*/
        //console.log(req.body.events[0].source)
        console.log(req.body.entry[0].messaging)
        res.send(req.body)
    }
    
    // https://c6fd29f5.ngrok.io/bots/line/notifications
    app.post('/bots/line/notifications', line_callback)
    
    // 3. Webhook for Facebook Messenger
    function fb_callback(req, res)
    {
        console.dir(req.body)
        res.send(req.body)
    }

    app.post(`/bots/facebook/notifications`, fb_callback)
    
    // 3.a. Webhook Verification for Facebook Messenger
    function fb_verify_callback(req, res)
    {
        if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'verify_token')
        {
            console.log("Validating webhook");
            console.dir(req.query);
            res.send(`${req.query['hub.challenge']}`)
        }
        
        else
        {
            console.error("Failed validation. Make sure the validation tokens match.");
            res.sendStatus(403);          
        }  
    }
    
    app.get('/bots/facebook/notifications', fb_verify_callback);
}

module.exports = webhook_endpoints
