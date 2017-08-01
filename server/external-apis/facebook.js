"use strict"

// Copyright 2017 TRI R.A. WIBOWO

module.exports = class Line
{
    constructor()
    {
        // URL Template : https://api.telegram.org/bot<token>/METHOD_NAME

        // Page access token
        this.token = 'EAACSbQulFLUBADvYyGwjmXiCefGZA7MWZCeyyE5EhQvdfWqxwol0HPc91WVVye8xBkfwbFbTZCrlKhYG4dVAJg8qkhHD3TZBMFK8hR0UBxggBZB5iOiu26IjS1gUbgPFNrLPPEj7RalUXcdsq5UYAoSIK6h5uN2UQiQBWnwOHXQZDZD'

        this.endpoint = `https://api.telegram.org/bot${this.token}/`
    }

    add_phone_number()
    {}

    remove_phone_number()
    {}

    send_text(is_multiple_recipients = false)
    {}
}
