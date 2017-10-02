"use strict"

// Copyright 2017 Tri R.A. Wibowo

let postgres = require('pg-promise')()
let db = postgres('postgres://postgres:l4nte_T751mp3g@127.0.0.1:5432/DBSIMPEG')
//let db = postgres('postgres://postgres@localhost:5432/DBSIMPEG')

module.exports = db