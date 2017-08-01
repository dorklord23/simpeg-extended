"use strict"

// Copyright 2017 TRI R.A. WIBOWO

module.exports = class Line
{
    constructor()
    {
        // URL Template : https://api.telegram.org/bot<token>/METHOD_NAME

        this.token = 'vXMMb2YbEJAYixxIauEAb7322N2oJOAEz+9MBKTb+c4oFK5eCd8ELBysipgmhDhXBBucd07VhAzPh2uTitINtXawHvsiTBPLGkGO3CXGCGM0jVEzHTqusam/qvs0T7r704zLn8GU4Ajvodx6yxoJTAdB04t89/1O/w1cDnyilFU='

        this.endpoint = `https://api.telegram.org/bot${this.token}/`
    }

    add_phone_number()
    {}

    remove_phone_number()
    {}

    send_text(is_multiple_recipients = false)
    {}
}
