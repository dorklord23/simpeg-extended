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
    // 1. Check employees who are eligible for KGB this month
    function usulan_kgb(req, res)
    {
        let year_diff = `extract(year from CURRENT_TIMESTAMP) - extract(year from tmt_gol)`
        let month_diff = `extract(month from CURRENT_TIMESTAMP) - extract(month from tmt_gol)`

        let query = `SELECT peg.nip, nama FROM th_pangkat JOIN m_pegawai peg WHERE 2 = ${year_diff} AND 0 = ${month_diff} AND char_length(nip) = 18`
        //let query = `SELECT nip FROM m_pegawai LIMIT 1`

        console.log(query)

        db.query(query).then(show_result.bind(null, res)).catch(show_error.bind(null, res))
    }

    app.get(`/api/v1/usulan_kgb`, usulan_kgb)
    
    app.get(`/iseng`, (req, res) => {res.send('TEST')})

}

module.exports = api_endpoints
