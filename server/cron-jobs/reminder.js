"use strict"

// Copyright 2017 TRI R.A. WIBOWO

let Telegram = require('../external-apis/telegram.js')
let telegram = new Telegram()

let nodemailer = require('nodemailer')
let email_address = 'adminsimpeg@bnn.go.id'

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'cpanel.bnn.go.id',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: email_address,
        pass: 'simpeg123456'
    }
})

let axios = require('axios')

let postgres = require('pg-promise')()
let db = postgres('postgres://postgres:l4nte_T751mp3g@127.0.0.1:5432/DBSIMPEG')

function promise_error_callback(error)
{
    console.log(error.stack)
}

class Reminder
{
    constructor()
    {}

    // Cek Kenaikan Gaji Berkala
    check_kgb()
    {
        /*let year_diff = `extract(year from CURRENT_TIMESTAMP + interval '4 month') - extract(year from tmt_gol)`
        let month_diff = `extract(month from CURRENT_TIMESTAMP) - extract(month from tmt_gol)`*/

        let query = `SELECT peg.nip, nama FROM th_pangkat pang JOIN m_pegawai peg ON pang.nip = peg.nip WHERE date_trunc('month', CURRENT_DATE) + interval '4 month' = tmt_gol + interval '2 year' -- AND statpeg IN ('1', '2', '6') -- AND char_length(peg.nip) = 18`
        //let query = `SELECT nip FROM m_pegawai LIMIT 1`

        console.log(query)

        return db.query(query)//.then().catch()
    }

    // Cek kenaikan pangkat
    check_preferment()
    {}

    // Cek tanda kehormatan
    check_satyalancana()
    {}

    // Cek pensiun
    check_retirement()
    {}

    send_email(mail_params)
    {
        mail_params.from = `"Bot SIMPEG" <${email_address}>`

        // setup email data with unicode symbols
        /*let mailOptions =
        {
            from: `"Admin SIMPEG" <${email_address}>`, // sender address
            to: mail_params.to, // list of receivers separated by comma
            subject: mail_params.subject, // Subject line
            text: mail_params.text, // plain text body
            html: mail_params.html // html body
        }*/

        function send(resolve, reject)
        {
            function send_email_callback(error, info)
            {
                if (error)
                {
                    return reject(error)
                }

                let result = `Message ${info.messageId} sent: ${info.response}`

                resolve(result)
            }

            // send mail with defined transport object
            transporter.sendMail(mail_params, send_email_callback)
        }

        let mail = new Promise(send)

        return mail.catch(promise_error_callback)
    }

    send_telegram()
    {
        //
    }

    async run(mail_params = {}, telegram_params = {})
    {
        mail_params =
        {
            to : 'trirawibowo@gmail.com',
            subject : 'tes',
            text : 'HALO'
        }

        /*let email = await send_email(mail_params)
        console.log(email)*/
    }
}

let reminder = new Reminder()
reminder.check_kgb().then((a)=>{console.log('xxx', a)}).catch(promise_error_callback)
