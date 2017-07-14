"use strict"

// Copyright 2017 TRI R.A. WIBOWO

var validator = require('validator')

var exceptionList = ['phone', 'phoneNumber', 'voucherCode', 'consigneePhoneNumber', 'awbNumber']

function isNumeric(num)
{
    // isNaN() values for these values should be true,
    // but somehow the values are false
    let shouldBeNaN = ['', [], {}]
    if (shouldBeNaN.includes(num))
    {
        return false
    }
    return ! isNaN(num)
}

// Internal function for sanitize.js middleware
var sanitizer = (userInput) =>
{
    for (var key in userInput)
    {
        if (userInput.hasOwnProperty(key))
        {
            switch (typeof userInput[key])
            {
                case 'string':
                    userInput[key] = validator.trim( validator.escape(userInput[key]) )
                    if (isNumeric(userInput[key]) && ! (exceptionList.includes(key)))
                    {
                        userInput[key] = parseInt(userInput[key])
                    }
                    break;
                default:
                    sanitizer(userInput[key])
            }
        }
    }
    return userInput
}

module.exports = (req, res, next) =>
{
    req.body = sanitizer(req.body)
    req.query = sanitizer(req.query)
    req.params = sanitizer(req.params)
    next()
}
