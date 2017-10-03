"use strict"
// Copyright 2017 TRI R.A. WIBOWO

// Endpoints for the SSL verification

function ssl_endpoints(app)
{
    app.get(`/ssl_verification/T-XjZT6NFkSbj13q0lDQ4V4XiE2MdzSQximSdAu-jnY`, (req, res) => {res.send('T-XjZT6NFkSbj13q0lDQ4V4XiE2MdzSQximSdAu-jnY.XecrRatmntg81yoI6cB5L0VSqCRFnQyPPQiJxuc3YcQ')})

    app.get(`/ssl_verification/aIC7w8NqNEAYTNOPo1KhmV1fnXY5hFN4ypHhn5QgLNU`, (req, res) => {res.send('aIC7w8NqNEAYTNOPo1KhmV1fnXY5hFN4ypHhn5QgLNU.XecrRatmntg81yoI6cB5L0VSqCRFnQyPPQiJxuc3YcQ')})
}

module.exports = ssl_endpoints
