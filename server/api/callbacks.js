"use strict"
// Copyright 2017 TRI R.A. WIBOWO

// This file contains callbacks for API requests

const xlsx = require('xlsx')
const moment = require('moment')

function show_error(res, error, status_code = 400)
{
    console.log(error.stack)

    const result =
    {
        status : 'gagal',
        code : status_code,
        comment : error.message
    }

    res.status(status_code).json(result)
}

function check_params(req, params, type = 'query')
{
    let compulsory_params = []

    for (let key in params)
    {
        if ( ! params[key].optional)
        {
            compulsory_params.push(key)
        }
    }

    const submitted_params = Object.keys(req[type])
    const acceptable_params = Object.keys(params)

    for (let a = 0; a < compulsory_params.length; a++)
    {
        if ( ! submitted_params.includes(compulsory_params[a]))
        {
            throw new Error(`Tidak ada parameter ${compulsory_params[a]}`)
        }
    }

    for (let a = 0; a < acceptable_params.length; a++)
    {
        if (typeof req[type][acceptable_params[a]] === 'undefined' && params[acceptable_params[a]].optional)
        {
            req[type][acceptable_params[a]] = params[acceptable_params[a]].default
        }
    }

    return req[type]
}

function show_result(res, result, comment = '', status_code = 200, format = 'json')
{
    switch(format)
    {
        case 'json':
            const result_ =
            {
                status : 'berhasil',
                code : status_code,
                comment : comment,
                data : result
            }

            res.status(status_code).json(result_)
            break

        case 'xlsx':
            const filename = result

            res.status(status_code).download(`${filename}.${format}`)
            break
    }
}

class Callbacks
{
    constructor(database)
    {
        this.db = database
    }

    // Retrieving employees' data for SOA-based SIN
    async employee(req, res)
    {
        const params =
        {
            nip : {optional : false, default : ''},
            //nama : {optional : true, default : ''},
            //baris : {optional : true, default : 10}
        }

        try
        {
            req.query = check_params(req, params)
            let result = {}
            let comment = ''

            //const users = await db.any('SELECT nip, nama FROM m_pegawai WHERE nip LIKE $1 AND nama LIKE $2 LIMIT $3', [`%${req.query.nip}%`, `%${req.query.nama}%`, req.query.baris])

            //const users = await this.db.any("SELECT nip, nama FROM m_pegawai WHERE CASE WHEN $1 <> '%%' THEN nip LIKE $1 ELSE TRUE END AND CASE WHEN $2 <> '%%' THEN nama LIKE $2 ELSE TRUE END LIMIT $3", [`%${req.query.nip}%`, `%${req.query.nama}%`, req.query.baris])

            const query = "SELECT pangkat, gelar_depan, nama, gelar_blkg gelar_belakang, jabatan, golongan, es.eselon eselon, (SELECT nmunit FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = '00' AND s.kdu3 = '000' AND s.kdu4 = '000' LIMIT 1) eselon_1, (SELECT nmunit FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = j.kdu2 AND s.kdu3 = '000' AND s.kdu4 = '000' LIMIT 1) eselon_2, (SELECT nmunit FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = j.kdu2 AND s.kdu3 = j.kdu3 AND s.kdu4 = '000'LIMIT 1) eselon_3, (SELECT nmunit FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = j.kdu2 AND s.kdu3 = j.kdu3 AND s.kdu4 = j.kdu4 LIMIT 1) eselon_4 FROM th_jabatan j JOIN m_pegawai p ON j.nip = p.nip JOIN th_pangkat pang ON p.nip = pang.nip JOIN tr_golongan gol ON pang.gol = gol.kode JOIN tr_jabatan jab ON k_jabatan = jab.kode JOIN tr_eselon es ON j.eselon = es.kode WHERE p.nip = $1 ORDER BY tmt_jabatan DESC, tmtesel DESC, pang.tmt_gol DESC LIMIT 1"

            const users = await this.db.any(query, [req.query.nip])

            if (users.length === 0)
            {
                const error = new Error(`Tidak ada pegawai dengan NIP/NRP ${req.query.nip}`)
                return show_error(res, error, 404)
            }

            if (users.length > 1)
            {
                comment = `Ada duplikasi data pegawai dengan NIP/NRP ${req.query.nip}`
            }
            /*for (let a = 0; a < users.length; a++)
            {
                let result = {nip : users[a].nip, nama : users[a].nama}
                results.push(result)
            }*/

            //result.nama = users[0].nama
            result =
            {
                pangkat : users[0].pangkat,
                gelar_depan : users[0].gelar_depan,
                nama : users[0].nama,
                gelar_belakang : users[0].gelar_blkg,
                jabatan : users[0].jabatan,
                golongan : users[0].golongan,
                eselon : users[0].eselon,
                eselon_1 : users[0].eselon_1,
                eselon_2 : users[0].eselon_2,
                eselon_3 : users[0].eselon_3,
                eselon_4 : users[0].eselon_4
            }

            console.dir(result)

            show_result(res, result, comment)
        }

        catch(e)
        {
            show_error(res, e, 500)
        }
    }

    // Retrieving employees' data in a particular file format, e.g. MS Excel, for BKN's SAPK
    async employee_export(req, res)
    {
        try
        {
            const workbook =
            {
                SheetNames:['Data'], Sheets:{}
            }

            const headers = [
                [ "S", "h", "e", "e", "t", "J", "S" ]
            ]

            // NIP : 19901123 201502 1 003
            // Rank promotion is done every April and October so we retrieve data of employees who are eligible for
            // the promotion before those months i.e. October to March in April (round 1) and April to September in October (round 2).
            const current_year = parseInt(moment().format('YYYY'))
            let years_gone_by = 5

            // Eligible employees for each round
            const rounds =
            [
                // Round 1
                {
                    eligible_months : ['10', '11', '12', '01', '02', '03'],
                    patterns : []
                },

                // Round 2
                {
                    eligible_months : ['04', '05', '06', '07', '08', '09'],
                    patterns : []
                }
            ]

            function generate_patterns(round)
            {
                for (let a = 0; a < rounds[round].eligible_months; a++)
                {
                    if (a > 2 || round === 1)
                    {
                        years_gone_by = 4
                    }

                    rounds[round].patterns.push('________' + (current_year- years_gone_by) + rounds[round].eligible_months[a] + '____')
                }

                // nip LIKE '' OR nip LIKE ''
                const subquery = rounds[round].patterns.join('')

                return `nip LIKE ${subquery}`
            }

            const query = 'SELECT nip, nama FROM m_pegawai WHERE nip '

            let contents = [  1,  2 ,  3 ,  4 ,  5 ]
            headers.push(contents)

            let worksheet = xlsx.utils.aoa_to_sheet(headers)

            workbook.Sheets.Data = worksheet

            const filename = '/tmp/data_pegawai'

            xlsx.writeFile(workbook, `${filename}.xlsx`)
            show_result(res, filename, '', 200, 'xlsx')
        }

        catch(err)
        {
            show_error(res, err)
        }
    }
}

module.exports = Callbacks
