"use strict"

// Copyright 2017 TRI R.A. WIBOWO

module.exports = class Telegram
{
    constructor()
    {
        // URL Template : https://api.telegram.org/bot<token>/METHOD_NAME

        this.token = '424490082:AAEpCy2c62qfqj-n5F9oz5X60iRE08g47gk'

        this.endpoint = `https://api.telegram.org/bot${this.token}/`
    }

    add_phone_number()
    {}

    remove_phone_number()
    {}

    send_text(multiple_recipients = false)
    {}
}
