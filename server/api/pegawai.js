"use strict"
// Copyright 2017 TRI R.A. WIBOWO

// This file contains callbacks for API requests

class Pegawai
{
    constructor(db, nip)
    {
        const query = ``
        this.db = db
        this.data = this.db.any(query, [nip])
    }

    pangkat()
    {}

    lama_dinas()
    {}

    pendidikan()
    {}

    jabatan()
    {}

    diklat()
    {}

    sanksi()
    {}

    pidana()
    {}

    penilaian()
    {}
}

module.exports = Pegawai
