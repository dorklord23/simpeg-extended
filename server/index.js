"use strict"

// Copyright 2017 Tri R.A. Wibowo

// Variables

// SIMPEG BNN's IP address
//let address = "103.3.70.11"
let address = "0.0.0.0"

if (process.argv[2] === 'localhost')
{
    address = "127.0.0.1"
}

// Telegram requires webhook with port 443,80,88 or 8443.
// LINE does not enforce particular ports to use
let port = 8080

// Helmet Initialization
let helmet = require('helmet')

// ExpressJS Initialization
let express = require('express'),
    http = require('http'),
    app = express(),
    httpServer = http.createServer(app);

// SIMPEG API Initialization
let api_endpoints = require('./endpoints/api.js')

// Webhook initialization for Telegram and LINE (soon)
let webhook_endpoints = require('./endpoints/webhook.js')

// Custom middlewares initialization
let sanitize = require('./middlewares/sanitize.js')
let res_headers = require('./middlewares/res_headers.js')

// bodyParser Initialization
let bodyParser = require('body-parser')

app.use(bodyParser.json({type: 'application/json'}))
app.use(bodyParser.json({type: 'application/csp-report'}))

app.use(bodyParser.urlencoded( {extended: true} ))

app.use(helmet())
app.use(sanitize)
app.use(res_headers)

let postgres = require('pg-promise')()
let db = postgres('postgres://postgres:l4nte_T751mp3g@127.0.0.1:5432/DBSIMPEG')
//let db = postgres('postgres://postgres@localhost:5432/DBSIMPEG')

// Path initialization
api_endpoints(app, db)
webhook_endpoints(app, db)

httpServer.listen(port, address)
console.log(`Running in http://${address}:${port}/`)
