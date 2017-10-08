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
            let comment = 'Berhasil menarik data pegawai'

            // For debugging purpose
            if (req.query.nip === 'x')
            {
                result =
                {
                    pangkat : 'pangkat',
                    gelar_depan : 'gelar_depan',
                    nama : 'nama',
                    gelar_belakang : 'gelar_belakang',
                    jabatan : 'jabatan',
                    golongan : 'golongan',
                    eselon : 'eselon',
                    eselon_1 : 'eselon_1',
                    eselon_2 : 'eselon_2',
                    eselon_3 : 'eselon_3',
                    eselon_4 : 'eselon_4'
                }

                return show_result(res, result)
            }

            //const users = await db.any('SELECT nip, nama FROM m_pegawai WHERE nip LIKE $1 AND nama LIKE $2 LIMIT $3', [`%${req.query.nip}%`, `%${req.query.nama}%`, req.query.baris])

            //const users = await this.db.any("SELECT nip, nama FROM m_pegawai WHERE CASE WHEN $1 <> '%%' THEN nip LIKE $1 ELSE TRUE END AND CASE WHEN $2 <> '%%' THEN nama LIKE $2 ELSE TRUE END LIMIT $3", [`%${req.query.nip}%`, `%${req.query.nama}%`, req.query.baris])

            const query = "SELECT pangkat, gelar_depan, nama, gelar_blkg, jabatan, golongan, es.eselon, (SELECT nmunit FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = '00' AND s.kdu3 = '000' AND s.kdu4 = '000' LIMIT 1) eselon_1, (SELECT nmunit FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = j.kdu2 AND s.kdu3 = '000' AND s.kdu4 = '000' LIMIT 1) eselon_2, (SELECT nmunit FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = j.kdu2 AND s.kdu3 = j.kdu3 AND s.kdu4 = '000'LIMIT 1) eselon_3, (SELECT nmunit FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = j.kdu2 AND s.kdu3 = j.kdu3 AND s.kdu4 = j.kdu4 LIMIT 1) eselon_4 FROM th_jabatan j JOIN m_pegawai p ON j.nip = p.nip JOIN th_pangkat pang ON p.nip = pang.nip JOIN tr_golongan gol ON pang.gol = gol.kode JOIN tr_jabatan jab ON k_jabatan = jab.kode JOIN tr_eselon es ON j.eselon = es.kode WHERE p.nip = $1 ORDER BY tmt_jabatan DESC, tmtesel DESC, pang.tmt_gol DESC LIMIT 1"

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
                pangkat : typeof users[0].pangkat === 'undefined' ? 'kosong' : users[0].pangkat,
                gelar_depan : typeof users[0].gelar_depan === 'undefined' ? 'kosong' : users[0].gelar_depan,
                nama : typeof users[0].nama === 'undefined' ? '' : users[0].nama,
                gelar_belakang : typeof users[0].gelar_blkg === 'undefined' ? 'kosong' : users[0].gelar_blkg,
                jabatan : typeof users[0].jabatan === 'undefined' ? 'kosong' : users[0].jabatan,
                golongan : typeof users[0].golongan === 'undefined' ? 'kosong' : users[0].golongan,
                eselon : typeof users[0].eselon === 'undefined' ? 'kosong' : users[0].eselon,
                eselon_1 : typeof users[0].eselon_1 === 'undefined' ? 'kosong' : users[0].eselon_1,
                eselon_2 : typeof users[0].eselon_2 === 'undefined' ? 'kosong' : users[0].eselon_2,
                eselon_3 : typeof users[0].eselon_3 === 'undefined' ? 'kosong' : users[0].eselon_3,
                eselon_4 : typeof users[0].eselon_4 === 'undefined' ? 'kosong' : users[0].eselon_4
            }

            for (let key in result)
            {
                if (result.hasOwnProperty(key) && result[key] === '')
                {
                    result[key] = 'kosong'
                }
            }

            console.dir(result)

            show_result(res, result, comment)
        }

        catch(e)
        {
            show_error(res, e, 500)
        }
    }

    async structure(req, res)
    {
        try
        {
            const subquery_1 = "SELECT nmunit nama, 1 eselon, kdu1, kdu2, kdu3, kdu4 FROM struktur s WHERE kdu1 <> '00' AND kdu2 = '00' AND kdu3 = '000' AND kdu4 = '000'"
            const subquery_2 = "SELECT nmunit nama, 2 eselon, kdu1, kdu2, kdu3, kdu4 FROM struktur s WHERE kdu1 <> '00' AND kdu2 <> '00' AND kdu3 = '000' AND kdu4 = '000'"
            const subquery_3 = "SELECT nmunit nama, 3 eselon, kdu1, kdu2, kdu3, kdu4 FROM struktur s WHERE kdu1 <> '00' AND kdu2 <> '00' AND kdu3 <> '000' AND kdu4 = '000'"
            const subquery_4 = "SELECT nmunit nama, 4 eselon, kdu1, kdu2, kdu3, kdu4 FROM struktur s WHERE kdu1 <> '00' AND kdu2 <> '00' AND kdu3 <> '000' AND kdu4 <> '000'"

            const query = `(${subquery_1}) UNION ALL (${subquery_2}) UNION ALL (${subquery_3}) UNION ALL (${subquery_4})`

            const structure = await this.db.any(query)

            //show_result(res, structure)
            show_result(res, structure)
        }

        catch(err)
        {
            show_error(res, err, 500)
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
