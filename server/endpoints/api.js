"use strict"
// Copyright 2017 TRI R.A. WIBOWO

// Endpoints for the API

const Callbacks = require('../api/callbacks.js')

function api_endpoints(app, db)
{
    const callbacks = new Callbacks(db)

    app.get(`/api/pegawai`, (req, res) => {callbacks.employee(req, res)})
    app.get(`/api/struktur`, (req, res) => {callbacks.structure(req, res)})

    app.get(`/api/pegawai/ekspor`, (req, res) => {callbacks.employee_export(req, res)})
}

module.exports = api_endpoints
