"use strict"

// Copyright 2017 TRI R.A. WIBOWO

const {xml, Client = require('@xmpp/client')
const client = new Client()

// Log errors
client.on('error', err => {
  console.error('❌', err.toString())
})

// Log status changes
client.on('status', (status, value) => {
  console.log('🛈', status, value ? value.toString() : '')
})

// Useful for logging raw traffic
// Emitted for every incoming fragment
client.on('input', data => console.log('⮈', data))
// Emitted for every outgoing fragment
client.on('output', data => console.log('⮊', data))

// Useful for logging XML traffic
// Emitted for every incoming XML element
// client.on('element', data => console.log('⮈', data))
// Emitted for every outgoing XML element
// client.on('send', data => console.log('⮊', data))

client.on('stanza', el => {
  if (el.is('presence') && el.attrs.from === client.jid.toString()) {
    console.log('🗸', 'available, ready to receive <message/>s')
  }
})

client.on('online', jid => {
  console.log('jid', jid.toString())
  client.send(xml('presence'))
})

// "start" opens the socket and the XML stream
//client.start('localhost') // Auto
client.start('xmpp://localhost:5222') // TCP
// client.start('xmpps://localhost:5223') // TLS
// client.start('ws://localhost:5280/xmpp-websocket') // Websocket
// client.start('wss://localhost:5281/xmpp-websocket') // Secure WebSocket
  .catch(err => {
    console.error('start failed', err)
  })

// Handle authentication to provide credentials
client.handle('authenticate', authenticate => {
  return authenticate('jin_simpeg', 'simpeg123456')
})

// Handle binding to choose resource - optional
client.handle('bind', bind => {
  return bind('example')
})

module.exports = class XMPP
{
    constructor()
    {
        this.client
    }

    add_phone_number()
    {}

    remove_phone_number()
    {}

    send_text(is_multiple_recipients = false)
    {}
}
