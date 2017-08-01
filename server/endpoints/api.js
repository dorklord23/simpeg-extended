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

function api_endpoints(app, db)
{
    app.get(`/iseng`, (req, res) => {res.send('TEST')})

}

module.exports = api_endpoints
