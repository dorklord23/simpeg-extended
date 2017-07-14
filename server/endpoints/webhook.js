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

    app.post(`/telegram`, telegram_callback)
}

module.exports = webhook_endpoints
