"use strict"
// Copyright 2017 TRI R.A. WIBOWO

// Endpoints for the API

const Callbacks = require('../api/callbacks.js')

function api_endpoints(app, db)
{
    const callbacks = new Callbacks(db)

    app.get(`/api/pegawai`, (req, res) => {callbacks.employee(req, res)})
    app.get(`/api/pegawai/foto`, (req, res) => {callbacks.avatar(req, res)})
    app.get(`/api/struktur`, (req, res) => {callbacks.structure(req, res)})
    app.get(`/api/jabatan`, (req, res) => {callbacks.position(req, res)})
    app.get(`/api/daftar_panjang`, (req, res) => {callbacks.long_list(req, res)})

    app.get(`/api/satker`, (req, res) => {callbacks.work_unit_list(req, res)})
    app.get(`/api/satker/pegawai/jumlah`, (req, res) => {callbacks.work_unit_employee(req, res, 'qty')})
    app.get(`/api/satker/pegawai`, (req, res) => {callbacks.work_unit_employee(req, res, 'list')})

    app.get(`/api/pegawai/ekspor`, (req, res) => {callbacks.employee_export(req, res)})
}

module.exports = api_endpoints
