"use strict"

// Copyright 2017 TRI R.A. WIBOWO

let Telegram = require('../external-apis/telegram.js')
let telegram = new Telegram()

let nodemailer = require('nodemailer')
let email_address = 'adminsimpeg@bnn.go.id'

let axios = require('axios')

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

function promise_error_callback(error)
{
    console.log(error.stack)
}

function monthly_kgb()
{}

function send_email(mail_params)
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

function send_telegram()
{
    //
}

async function run_reminder(mail_params = {}, telegram_params = {})
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

run_reminder()
