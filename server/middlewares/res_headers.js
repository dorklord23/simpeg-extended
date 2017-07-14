"use strict"

// Copyright 2017 TRI R.A. WIBOWO

function set_headers(req, res, next)
{
    res.setHeader('access-control-allow-origin', 'http://localhost:3000')
    res.setHeader('content-type', 'application/json')

    next()
}

module.exports = set_headers
