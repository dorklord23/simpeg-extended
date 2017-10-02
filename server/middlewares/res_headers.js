"use strict"

// Copyright 2017 TRI R.A. WIBOWO

function set_headers(req, res, next)
{
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
    //res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')

    next()
}

module.exports = set_headers
