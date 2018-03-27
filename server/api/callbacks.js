"use strict"
// Copyright 2017 TRI R.A. WIBOWO

// This file contains callbacks for API requests

const xlsx = require('xlsx')
const fs = require('fs')
const base64 = require('node-base64-image')
const moment = require('moment')
const Pegawai = require('./pegawai')

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
        case 'jpg':
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

    async investigator_list(req, res)
    {
        try
        {
            const params =
            {
                page : {optional : true, default : 1}
            }

            req.query = check_params(req, params)

            const use_page = req.query.page === 'all' ? '' : `LIMIT 10 OFFSET $1`

            const query = `SELECT * FROM (SELECT DISTINCT ON (p.nip) p.nama, p.nip, j.n_jabatan jabatan /*, tmt_jabatan, j.lok, j.kdu1, j.kdu2, j.kdu3, j.kdu4*/ FROM m_pegawai p JOIN th_jabatan j ON p.nip = j.nip ORDER BY p.nip ASC, tmt_jabatan DESC) s WHERE jabatan ILIKE 'penyidik%' ${use_page}`

            const investigators = await this.db.any(query, [(req.query.page - 1) * 10])

            show_result(res, investigators, 'Berhasil menarik daftar penyidik')
        }

        catch(e)
        {
            show_error(res, e, 500)
        }
    }

    async work_unit_list(req, res)
    {
        // NOTE : Penentuan satker dari field "keterangan" di tabel "struktur". Cari yang value-nya "KPA".
        try
        {
            /*const params =
            {
                unit_name : {optional : false, default : ''}
            }

            req.query = check_params(req, params)*/

            const query = `SELECT id, nmunit, e.eselon FROM struktur s JOIN tr_eselon e ON s.eselon = e.kode WHERE keterangan LIKE '%KPA%' ORDER BY e.eselon ASC, nmunit ASC`
            const units = await this.db.any(query)

            if (units.length === 0)
            {
                const error = new Error('Tidak ada data satker yang valid')
                return show_error(res, error, 404)
            }

            let result = []

            for (let a = 0; a < units.length; a++)
            {
                const unit =
                {
                    id : units[a].id,
                    nama : units[a].nmunit,
                    eselon : units[a].eselon
                }

                result.push(unit)
            }

            show_result(res, result, 'Berhasil menarik daftar satuan kerja')
        }

        catch(e)
        {
            show_error(res, e, 500)
        }
    }

    async work_unit_employee(req, res, type, is_investigator = false)
    {
        async function get_employee_qty(echelon)
        {
            if (echelon.length === 0)
            {
                throw new Error('Tidak ada satker dengan ID dimaksud')
            }

            //const subquery = type === 'qty' ? 'COUNT(p.nama) qty' : 'p.nip, p.nama'
            const subquery = type === 'qty' ? 'COUNT(hj.nama) qty' : 'hj.nip, hj.nama'

            //let query = `SELECT ${subquery} FROM m_pegawai p JOIN struktur s ON s.kdu$2 = p.kdu$2 WHERE s.id = $1 AND CASE WHEN $1 = 1 THEN p.kdu2 IN ('01', '02', '03', '04') ELSE TRUE END`
            const subquery2 = `SELECT DISTINCT ON (p.nip) p.nama, p.nip, j.n_jabatan, j.lok, j.kdu1, j.kdu2, j.kdu3, j.kdu4 FROM m_pegawai p JOIN th_jabatan j ON p.nip = j.nip ORDER BY p.nip ASC, tmt_jabatan DESC` // ORDER BY tmt_jabatan DESC

            let query = `SELECT ${subquery} FROM (${subquery2}) hj JOIN struktur s ON s.kdu$2 = hj.kdu$2 WHERE s.id = $1 AND CASE WHEN $1 = 1 THEN /*hj.kdu2 IN ('01', '02', '03', '04') AND*/ hj.lok = '1' ELSE TRUE END`

            if (is_investigator)
            {
                query += ` AND hj.n_jabatan ILIKE 'penyidik%'`
            }

            if (type === 'list')
            {
                if (req.query.page === 'all') {
                    query += ' '
                }

                else {
                    const limit = 10
                    query += ` LIMIT ${limit} OFFSET ${(req.query.page - 1) * limit}`
                }
            }

            const employees = await this.db.any(query, [req.query.unit_id, echelon[0].tktesel])

            if (employees.length === 0)
            {
                throw new Error('Tidak ada pegawai untuk satker dimaksud')
            }

            // result for type === qty
            let result =
            {
                satker : echelon[0].nmunit,
                qty : parseInt(employees[0].qty)
            }

            if (type === 'list')
            {
                result =
                {
                    satker : echelon[0].nmunit,
                    halaman : req.query.page,
                    pegawai : employees.map(employee => {return {nip : employee.nip, nama : employee.nama}})
                }
            }

            return result//type === 'qty' ? qty : list
        }

        try
        {
            let params =
            {
                unit_id : {optional : false, default : ''}
            }

            if (type === 'list')
            {
                params.page = {optional : true, default : 1}
            }

            req.query = check_params(req, params)

            const query = `SELECT e.tktesel, s.nmunit FROM struktur s JOIN tr_eselon e ON s.eselon = e.kode WHERE s.keterangan LIKE '%KPA%' AND s.id = $1`

            const employees = await this.db.any(query, [req.query.unit_id]).then(get_employee_qty.bind(this))

            show_result(res, employees, 'Berhasil menarik daftar pegawai satuan kerja')
        }

        catch(e)
        {
            show_error(res, e, 500)
        }
    }

    async avatar(req, res)
    {
        const params =
        {
            nip : {optional : false, default : ''}
        }

        try
        {
            req.query = check_params(req, params)
            let filename = `/var/www/html/bnn-simpeg/_uploads/photo_pegawai/thumbs/${req.query.nip}`

            //fs.open(`${filename}.jpg`, 'r', (err, fd) => {
            fs.access(`${filename}.jpg`, (err) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        // Customizing error message
                        err.message = `Tidak menemukan foto profil untuk NIP/NRP ${req.query.nip}`

                        //show_error(res, err, 404)

                        filename = `/var/www/html/bnn-simpeg/_uploads/photo_pegawai/thumbs/no_photo`

                        // Send placeholder image instead of error response
                        //show_result(res, filename, err.message, 200, 'jpg')

                        base64.encode(`${filename}.jpg`, {string:true, local:true}, (error, response) => {
                            if (error)
                            {
                                show_error(res, error, 500)
                                return
                            }

                            show_result(res, response, 'Gagal memperoleh base64 string', 500, 'json')
                        })

                        return
                    }
                    //console.error(err)
                    //throw err;
                    show_error(res, err, 500)
                }

                else
                {
                    base64.encode(`${filename}.jpg`, {string:true, local:true}, (err, response) => {
                        if (err)
                        {
                            show_error(res, err, 500)
                            return
                        }

                        show_result(res, response, 'Berhasil memperoleh base64 string')
                    })
                }
            })
        }

        catch(e)
        {
            show_error(res, e, 500)
        }
    }

    // Retrieving employees' data for SOA-based SIN
    async employee(req, res)
    {
        const params =
        {
            nip : {optional : false, default : ''},
            unit : {optional : true, default : 0},
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

            let query = "SELECT pangkat, gelar_depan, nama, gelar_blkg, jabatan, golongan, es.eselon, (SELECT nmunit FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = '00' AND s.kdu3 = '000' AND s.kdu4 = '000' AND s.lok = p.lok LIMIT 1) eselon_1, (SELECT nmunit FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = j.kdu2 AND s.kdu3 = '000' AND s.kdu4 = '000' AND s.lok = p.lok LIMIT 1) eselon_2, (SELECT nmunit FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = j.kdu2 AND s.kdu3 = j.kdu3 AND s.kdu4 = '000' AND s.lok = p.lok LIMIT 1) eselon_3, (SELECT nmunit FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = j.kdu2 AND s.kdu3 = j.kdu3 AND s.kdu4 = j.kdu4 AND s.lok = p.lok LIMIT 1) eselon_4 FROM th_jabatan j JOIN m_pegawai p ON j.nip = p.nip JOIN th_pangkat pang ON p.nip = pang.nip JOIN tr_golongan gol ON pang.gol = gol.kode JOIN tr_jabatan jab ON k_jabatan = jab.kode JOIN tr_eselon es ON j.eselon = es.kode WHERE p.nip = $1 ORDER BY tmt_jabatan DESC, tmtesel DESC, pang.tmt_gol DESC LIMIT 1"

            if (req.query.unit === 1)
            {
                query = `SELECT gelar_depan, nama, gelar_blkg, (SELECT '{"id":"' || id || '","nama":"' || nmunit || '"}' FROM (SELECT id, nmunit, keterangan FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = '00' AND s.kdu3 = '000' AND s.kdu4 = '000' AND s.lok = p.lok UNION SELECT id, nmunit, keterangan FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = j.kdu2 AND s.kdu3 = '000' AND s.kdu4 = '000' AND s.lok = p.lok UNION SELECT id, nmunit, keterangan FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = j.kdu2 AND s.kdu3 = j.kdu3 AND s.kdu4 = '000' AND s.lok = p.lok UNION SELECT id, nmunit, keterangan FROM struktur s WHERE s.kdu1 = j.kdu1 AND s.kdu2 = j.kdu2 AND s.kdu3 = j.kdu3 AND s.kdu4 = j.kdu4 AND s.lok = p.lok) satker WHERE keterangan LIKE '%KPA%' LIMIT 1)::JSON satker FROM th_jabatan j JOIN m_pegawai p ON j.nip = p.nip JOIN th_pangkat pang ON p.nip = pang.nip JOIN tr_golongan gol ON pang.gol = gol.kode JOIN tr_jabatan jab ON k_jabatan = jab.kode JOIN tr_eselon es ON j.eselon = es.kode WHERE p.nip = $1 ORDER BY tmt_jabatan DESC, tmtesel DESC, pang.tmt_gol DESC LIMIT 1`
            }

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

            if (req.query.unit === 1)
            {
                console.log(users)
                result =
                {
                    gelar_depan : typeof users[0].gelar_depan === 'undefined' ? 'kosong' : users[0].gelar_depan,
                    nama : typeof users[0].nama === 'undefined' ? '' : users[0].nama,
                    gelar_belakang : typeof users[0].gelar_blkg === 'undefined' ? 'kosong' : users[0].gelar_blkg,
                    id_satker : typeof users[0].satker.id === 'undefined' ? 'kosong' : parseInt(users[0].satker.id),
                    nama_satker : typeof users[0].satker.nama === 'undefined' ? 'kosong' : users[0].satker.nama
                }
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
            /*const subquery_1 = "SELECT nmunit nama, 1 eselon, kdu1, kdu2, kdu3, kdu4 FROM struktur s WHERE kdu1 <> '00' AND kdu2 = '00' AND kdu3 = '000' AND kdu4 = '000'"
            const subquery_2 = "SELECT nmunit nama, 2 eselon, kdu1, kdu2, kdu3, kdu4 FROM struktur s WHERE kdu1 <> '00' AND kdu2 <> '00' AND kdu3 = '000' AND kdu4 = '000'"
            const subquery_3 = "SELECT nmunit nama, 3 eselon, kdu1, kdu2, kdu3, kdu4 FROM struktur s WHERE kdu1 <> '00' AND kdu2 <> '00' AND kdu3 <> '000' AND kdu4 = '000'"
            const subquery_4 = "SELECT nmunit nama, 4 eselon, kdu1, kdu2, kdu3, kdu4 FROM struktur s WHERE kdu1 <> '00' AND kdu2 <> '00' AND kdu3 <> '000' AND kdu4 <> '000'"*/
            const subquery_1 = "SELECT DISTINCT k_jabatan kode, n_jabatan nama, kdu1, kdu2, kdu3, kdu4, tktesel eselon FROM th_jabatan h JOIN tr_jabatan r ON r.kode = h.k_jabatan JOIN tr_eselon e ON e.kode = r.eselon WHERE kdu1 <> '00' AND kdu2 = '00' AND kdu3 = '000' AND kdu4 = '000'"
            const subquery_2 = "SELECT DISTINCT k_jabatan kode, n_jabatan nama, kdu1, kdu2, kdu3, kdu4, tktesel eselon FROM th_jabatan h JOIN tr_jabatan r ON r.kode = h.k_jabatan JOIN tr_eselon e ON e.kode = r.eselon WHERE kdu1 <> '00' AND kdu2 <> '00' AND kdu3 = '000' AND kdu4 = '000'"
            const subquery_3 = "SELECT DISTINCT k_jabatan kode, n_jabatan nama, kdu1, kdu2, kdu3, kdu4, tktesel eselon FROM th_jabatan h JOIN tr_jabatan r ON r.kode = h.k_jabatan JOIN tr_eselon e ON e.kode = r.eselon WHERE kdu1 <> '00' AND kdu2 <> '00' AND kdu3 <> '000' AND kdu4 = '000'"
            const subquery_4 = "SELECT DISTINCT k_jabatan kode, n_jabatan nama, kdu1, kdu2, kdu3, kdu4, tktesel eselon FROM th_jabatan h JOIN tr_jabatan r ON r.kode = h.k_jabatan JOIN tr_eselon e ON e.kode = r.eselon WHERE kdu1 <> '00' AND kdu2 <> '00' AND kdu3 <> '000' AND kdu4 <> '000'"


            const query = `${subquery_1} UNION ${subquery_2} UNION ${subquery_3} UNION ${subquery_4}`

            const structure = await this.db.any(query)

            //show_result(res, structure)
            show_result(res, structure)
        }

        catch(err)
        {
            show_error(res, err, 500)
        }
    }

    async position(req, res)
    {
        const params =
        {
            kdu1 : {optional : false, default : '[]'},
            kdu2 : {optional : true, default : '[]'},
            kdu3 : {optional : true, default : '[]'},
            kdu4 : {optional : true, default : '[]'}
        }

        try
        {
            req.query = check_params(req, params)

            // %5B tri %2C joko %2C debora %5D
            // [tri,joko,debora]
            //%5B %22 xx %22 %2C  %22 xx %22 %2C %22 xxx %22 %2C %22 xxx %22 %5D
            //["xx","xx","xxx","xxx"]
            // %27 === ' === #x27;
            // req.query.kdu1 === [&quot;00&quot;]
            console.log(req.query.kdu1)

            //console.log(JSON.parse(req.query.kdu1.replace(/&quot;/g, '"').replace(/&#x27;/g, "'")))
            let kdu1 = JSON.parse(req.query.kdu1.replace(/&quot;/g, '"').replace(/&#x27;/g, "'"))
            let kdu2 = JSON.parse(req.query.kdu2.replace(/&quot;/g, '"').replace(/&#x27;/g, "'"))
            let kdu3 = JSON.parse(req.query.kdu3.replace(/&quot;/g, '"').replace(/&#x27;/g, "'"))
            let kdu4 = JSON.parse(req.query.kdu4.replace(/&quot;/g, '"').replace(/&#x27;/g, "'"))
            console.log(kdu1)
            console.log(kdu1.join())

            kdu1 = (kdu1.length > 0) ? `kdu1 IN (${kdu1.join(',')})` : "kdu1 IN ('00')"
            kdu2 = (kdu2.length > 0) ? `kdu2 IN (${kdu2.join(',')})` : "kdu2 IN ('00')"
            kdu3 = (kdu3.length > 0) ? `kdu3 IN (${kdu3.join(',')})` : "kdu3 IN ('000')"
            kdu4 = (kdu4.length > 0) ? `kdu4 IN (${kdu4.join(',')})` : "kdu4 IN ('000')"

            /*const subquery1 = `SELECT k_jabatan kode, jabatan nama, kdu1, kdu2, kdu3, kdu4 FROM th_jabatan h JOIN tr_jabatan r ON r.kode = h.k_jabatan WHERE ${kdu1} AND kdu2 = '00' AND kdu3 = '000' AND kdu4 = '000'`
            const subquery2 = `SELECT k_jabatan kode, jabatan nama, kdu1, kdu2, kdu3, kdu4 FROM th_jabatan h JOIN tr_jabatan r ON r.kode = h.k_jabatan WHERE ${kdu1} AND ${kdu2} AND kdu3 = '000' AND kdu4 = '000'`
            const subquery3 = `SELECT k_jabatan kode, jabatan nama, kdu1, kdu2, kdu3, kdu4 FROM th_jabatan h JOIN tr_jabatan r ON r.kode = h.k_jabatan WHERE ${kdu1} AND ${kdu2} AND ${kdu3} AND kdu4 = '000'`
            const subquery4 = `SELECT k_jabatan kode, jabatan nama, kdu1, kdu2, kdu3, kdu4 FROM th_jabatan h JOIN tr_jabatan r ON r.kode = h.k_jabatan WHERE ${kdu1} AND ${kdu2} AND ${kdu3} AND ${kdu4}`*/

            //const query = `SELECT k_jabatan kode, jabatan nama, kdu1, kdu2, kdu3, kdu4 FROM th_jabatan h JOIN tr_jabatan r ON r.kode = h.k_jabatan WHERE ${kdu1} ${kdu2} ${kdu3} ${kdu4}`
            //const query = `${subquery1} UNION ${subquery2} UNION ${subquery3} UNION ${subquery4}`
            const query = `SELECT DISTINCT k_jabatan kode, n_jabatan nama, kdu1, kdu2, kdu3, kdu4, tktesel eselon FROM th_jabatan h JOIN tr_jabatan r ON r.kode = h.k_jabatan JOIN tr_eselon e ON e.kode = r.eselon WHERE ${kdu1} AND ${kdu2} AND ${kdu3} AND ${kdu4}`
            console.log(query)

            const position = await this.db.any(query)

            //show_result(res, structure)
            show_result(res, position)
        }

        catch(err)
        {
            show_error(res, err, 500)
        }
    }

    async long_list(req, res)
    {
        // Hanya support PNS sementara ini
        // Mesti memenuhi kualifikasi umum sesuai dgn ketentuan peraturan perundang2an dan
        // kualifikasi khusus yang menjadi patokan dalam penyusunan daftar panjang ini sbb:
        /* Eselon IV (Pengawas)
         * a. sehat jasmani dan rohani serta bebas narkoba yang
              dibuktikan dengan surat keterangan dari pejabat
              yang berwenang;
           b. pangkat/golongan minimal Penata Muda tingkat. I (III/b);
           c. jabatan pelaksana bagi yang berpendidikan S1/D IV paling sedikit memiliki pengalaman kerja
              selama 4 tahun dan bagi yang berpendidikan D III sekurang-kurangnya memiliki pengalaman kerja selama 12 tahun;
           d. pendidikan __DIUTAMAKAN__ paling rendah Diploma III atau yang sederajat;
           e. memiliki keahlian, pengetahuan, dan pengalaman sesuai bidang tugas untuk jabatan yang akan
              diduduki;
           f. __DIUTAMAKAN__ telah mengikuti dan lulus Diklat Kepemimpinan Tingkat IV atau yang dipersamakan;
           g. __DIUTAMAKAN__ telah mengikuti Diklat Teknis yang menunjang bidang tugasnya;
           h. tidak pernah dijatuhi hukuman disiplin tingkat sedang atau berat dalam 2 (dua) tahun terakhir;
           i. tidak pernah dipidana dengan pidana penjara berdasarkan putusan pengadilan mempunyai
              kekuatan hukum yang tetap sudah karena melakukan tindak pidana dengan pidana penjara 2 tahun atau lebih; dan
           j. memiliki penilaian kinerja dengan nilai baik.*/

        try
        {
            req.query.kdu1 = req.query.kdu1.replace(/&quot;/g, '"')
            req.query.kdu2 = req.query.kdu2.replace(/&quot;/g, '"')
            req.query.kdu3 = req.query.kdu3.replace(/&quot;/g, '"')
            req.query.kdu4 = req.query.kdu4.replace(/&quot;/g, '"')

            // http://localhost:8080/api/daftar_panjang?kdu1=[["01","00","000","000"]]&kdu2=[["01","02","000","000"]]&kdu3=[["01","02","002","000"]]&kdu4=[["01","02","002","002"]]

            const kdu1 = JSON.parse(req.query.kdu1)
            const kdu2 = JSON.parse(req.query.kdu2)
            const kdu3 = JSON.parse(req.query.kdu3)
            const kdu4 = JSON.parse(req.query.kdu4)

            const current_year = parseInt(moment().format('YYYY'))
            const current_month = parseInt(moment().format('MM'))

            // Golongan III-b ke atas
            const kriteria_pangkat_eselon_4 = `SELECT /*DISTINCT ON (p.nip)*/ p.nip, p.tktpdk FROM m_pegawai p JOIN tr_statuskepegw s ON p.statpeg = s.kode JOIN th_pangkat pang ON pang.nip = p.nip JOIN tr_golongan g ON pang.gol = g.kode WHERE s.kode IN ('1', '2') AND g.golongan IN ('III-b', 'III-c', 'III-d', 'IV-a', 'IV-b', 'IV-c', 'IV-d', 'IV-e') AND length(p.nip) = 18`

            // Empat tahun (48 bulan) bagi S1/D-IV dan 12 tahun (144 bulan) buat D-III
            const kriteria_lama_kerja_eselon_4 = `SELECT p.nip/*, rp.nama gelar*/ FROM (${kriteria_pangkat_eselon_4}) p LEFT JOIN th_pendidikan hp ON p.nip = hp.nip JOIN tr_pendidikan rp ON p.tktpdk = rp.kode WHERE rp.nama IN ('DIII', 'DIV', 'S1') AND CASE WHEN rp.nama = 'DIII' THEN (((${current_year} - CAST(substring(p.nip from 9 for 4) AS INTEGER)) * 12) + ${current_month} - CAST(substring(p.nip from 13 for 2) AS INTEGER)) >= 144 ELSE (((${current_year} - CAST(substring(p.nip from 9 for 4) AS INTEGER)) * 12) + ${current_month} - CAST(substring(p.nip from 13 for 2) AS INTEGER)) >= 48 END GROUP BY p.nip, /*rp.nama,*/ hp.thn_lulus ORDER BY hp.thn_lulus DESC`

            // NOTE : pendidikan sudah dirangkap di lama_kerja

            // Pengalaman sesuai dengan jabatan yang kosong (hanya mengambil yang satu satker dengan jabatan dimaksud [tentatif])
            // TODO : Cari satker dari jabatan2 yg pernah diduduki dan jabatan yg kosong
            const kriteria_pengalaman_eselon_4 = `SELECT p.nip, (SELECT nmunit FROM (SELECT 4 esl, keterangan, nmunit FROM struktur WHERE lok = j.lok AND kdu1 = j.kdu1 AND kdu2 = j.kdu2 AND kdu3 = j.kdu3 AND kdu4 = j.kdu4 UNION SELECT 3 esl, keterangan, nmunit FROM struktur WHERE lok = j.lok AND kdu1 = j.kdu1 AND kdu2 = j.kdu2 AND kdu3 = j.kdu3 AND kdu4 = '000' UNION SELECT 2 esl, keterangan, nmunit FROM struktur WHERE lok = j.lok AND kdu1 = j.kdu1 AND kdu2 = j.kdu2 AND kdu3 = '000' AND kdu4 = '000' UNION SELECT 1 esl, keterangan, nmunit FROM struktur WHERE lok = j.lok AND kdu1 = j.kdu1 AND kdu2 = '00' AND kdu3 = '000' AND kdu4 = '000') a WHERE keterangan LIKE '%KPA%' ORDER BY esl DESC LIMIT 1) nama_satker/*, j.lok, j.kdu1, j.kdu2, j.kdu3, j.kdu4, tmt_jabatan*/ FROM (${kriteria_lama_kerja_eselon_4}) p JOIN th_jabatan j ON p.nip = j.nip JOIN struktur s ON s.lok = j.lok AND s.kdu1 = j.kdu1 AND s.kdu2 = j.kdu2 AND s.kdu3 = j.kdu3 AND s.kdu4 = j.kdu4 /*WHERE p.nip = '198107201999121001'*/ GROUP BY p.nip, j.lok, j.kdu1, j.kdu2, j.kdu3, j.kdu4, tmt_jabatan, j.nmunit ORDER BY p.nip, tmt_jabatan DESC`

            // Diklat Kepemimpinan dan Diklat Teknis
            const kriteria_diklat_eselon_4 = `SELECT p.nip FROM th_diklat_penjenjangan pim JOIN (${kriteria_pengalaman_eselon_4}) p ON pim.nip = p.nip JOIN th_diklat_teknis t ON p.nip = t.nip WHERE pim.nama_diklat = 'Diklat Pim Tingkat IV'`

            const kriteria_sanksi_eselon_4 = `SELECT p.nip, tingkat FROM (${kriteria_diklat_eselon_4}) p LEFT JOIN th_sanksi s ON p.nip = s.nip LEFT JOIN sys_tingkat_hkmn_disiplin t ON s.tkt_hkmn = t.kode LEFT JOIN (SELECT p.nip FROM (${kriteria_diklat_eselon_4}) p LEFT JOIN th_sanksi s ON p.nip = s.nip LEFT JOIN sys_tingkat_hkmn_disiplin t ON s.tkt_hkmn = t.kode WHERE t.tingkat IN ('Sedang', 'Berat') AND s.tmt_hkmn >= (current_date - interval '2 years') AND s.tmt_hkmn <= current_date) pp ON p.nip <> pp.nip WHERE t.tingkat IS NULL OR t.tingkat = 'Ringan'`
            /*`SELECT p.nip, tingkat FROM (${kriteria_diklat_eselon_4}) p LEFT JOIN th_sanksi s ON p.nip = s.nip LEFT JOIN sys_tingkat_hkmn_disiplin t ON s.tkt_hkmn = t.kode WHERE t.tingkat IS NULL OR (t.tingkat NOT IN ('Sedang', 'Berat') AND s.tmt_hkmn >= (current_date - interval '2 years') AND s.tmt_hkmn <= current_date)`*/

            // NOTE : Buat riwayat pidana, dibuktikan secara fisik melalui SKCK saja
            const kriteria_pidana_eselon_4 = ``

            const kriteria_skp_eselon_4 = ``

            //console.log(req.query)
            show_result(res, [1,2,3])
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
