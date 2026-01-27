function getCookieValue(name) {
    let value = document.cookie.split(';').filter(item => item.trim().startsWith(name + '='))[0];
    if (value) {
        value = decodeURIComponent(value.split('=')[1]);
    } else {
        value = null;
    }
    return value;
}
let coder = JSON.parse(sessionStorage.getItem('coder'));
let token = getCookieValue('token');
let API_URL = getCookieValue('API_URL');
console.log(token)
console.log(coder)
document.getElementById('coder_nik').value = coder.nik
async function intal() {
    let inacbg_klaim = JSON.parse(sessionStorage.getItem('inacbg_klaim'));
    console.log(inacbg_klaim)
    let nomor_sep = document.getElementById('nomor_sep').value = inacbg_klaim.bridging_sep.no_sep
    let nomor_rm = document.getElementById('nomor_rm').value = inacbg_klaim.no_rkm_medis
    let nomor_kartu = document.getElementById('nomor_kartu').value = inacbg_klaim.pasien.no_peserta
    let nama_pasien = document.getElementById('nama_pasien').value = inacbg_klaim.pasien.nm_pasien
    let tgl_lahir = document.getElementById('tgl_lahir').value = inacbg_klaim.pasien.tgl_lahir
    let gender = document.getElementById('gender').value = inacbg_klaim.pasien.jk == "Perempuan" ? 2 : 1
    let jenis_rawat = document.getElementById('jenis_rawat').value = inacbg_klaim.status_lanjut == "Ranap" ? 1 : 2
    let kelas_rawat = document.getElementById('kelas_rawat')
    let tgl_masuk = document.getElementById('tgl_masuk')
    let tgl_pulang = document.getElementById('tgl_pulang')
    let nama_dokter = document.getElementById('nama_dokter')
    let prosedur_non_bedah = document.getElementById('prosedur_non_bedah')
    let prosedur_bedah = document.getElementById('prosedur_bedah')
    let konsultasi = document.getElementById('konsultasi')
    let tenaga_ahli = document.getElementById('tenaga_ahli')
    let keperawatan = document.getElementById('keperawatan')
    let penunjang = document.getElementById('penunjang')
    let radiologi = document.getElementById('radiologi')
    let laboratorium = document.getElementById('laboratorium')
    let kamar = document.getElementById('kamar')
    let obat = document.getElementById('obat')
    let alkes = document.getElementById('alkes')
    let bmhp = document.getElementById('bmhp')
    let sistole = document.getElementById('sistole')
    let diastole = document.getElementById('diastole')

    if (inacbg_klaim.bridging_sep.no_sep != '-'){
        console.log(inacbg_klaim.bridging_sep.klsrawat)
        kelas_rawat.value = inacbg_klaim.bridging_sep.klsrawat;
    }

    if (inacbg_klaim.status_lanjut == 'Ralan'){
        tgl_masuk.value = new Date(inacbg_klaim.tgl_registrasi).toISOString().slice(0, 16).replace('T', ' ');
        tgl_pulang.value = new Date(inacbg_klaim.tgl_registrasi).toISOString().slice(0, 16).replace('T', ' ');
        nama_dokter.value = inacbg_klaim.dokter.nm_dokter
    }else{
        let dataRanap = await fetch(
            API_URL + "/api/inacbg/ranap/dpjp?no_rawat=" + inacbg_klaim.no_rawat,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
        )
        dataRanap = await dataRanap.json();
        console.log(dataRanap.data)
        try {
            nama_dokter.value = dataRanap.data.nmDPJP
            tgl_masuk.value = new Date(dataRanap.data.sttrawat.tgl_masuk).toISOString().slice(0, 16).replace('T', ' ');
            tgl_pulang.value = new Date(dataRanap.data.sttrawat.tgl_keluar).toISOString().slice(0, 16).replace('T', ' ');
            prosedur_non_bedah.value = dataRanap.data.biaya.totalBiayaNonBedah
            prosedur_bedah.value = dataRanap.data.biaya.prosedur_bedah
            konsultasi.value = dataRanap.data.biaya.konsultasi
            tenaga_ahli.value = dataRanap.data.biaya.tenaga_ahli
            keperawatan.value = dataRanap.data.biaya.keperawatan
            penunjang.value = 0
            radiologi.value = dataRanap.data.biaya.radiologi
            laboratorium.value = dataRanap.data.biaya.laboratorium
            kamar.value = dataRanap.data.biaya.kamar
            obat.value = dataRanap.data.biaya.obat
            alkes.value = dataRanap.data.biaya.sewa_alat
            bmhp.value = dataRanap.data.biaya.bmhp
            if (dataRanap.data.hasilTensi != '-') {
                let dataTensi = dataRanap.data.hasilTensi.split('/')
                sistole.value = dataTensi[0]
                diastole.value = dataTensi[1]
            }

        } catch (error) {

        }

    }
    
    
}
intal()
document.getElementById('form_kirim_klaim').addEventListener('submit', async function (event) {
    event.preventDefault();
    let formData = new FormData(event.target);
    let dataFrom = Object.fromEntries(formData)
    console.log(dataFrom)
    new_claim(dataFrom)
    // let response = await fetch(
    //     API_URL + "/api/inacbg/klaim",
    //     {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': 'Bearer ' + token
    //         },
    //         body: JSON.stringify(Object.fromEntries(formData))
    //     }
    // )
    // response = await response.json();
    // if (response.status == 'success') {
    //     alert('Data berhasil dikirim');
    //     window.location.href = '/dashboard/inacbg_klaim';
    // } else {
    //     alert('Gagal mengirim data, silahkan coba lagi');
    // }
});


function new_claim(dataFrom) {
    console.log(dataFrom)
    let databody =
    {
        "metadata": {
            "method": "new_claim"
        },
        "data": {
            "nomor_kartu": dataFrom.nomor_kartu,
            "nomor_sep": dataFrom.nomor_sep,
            "nomor_rm": dataFrom.nomor_rm,
            "nama_pasien": dataFrom.nama_pasien,
            "tgl_lahir": dataFrom.tgl_lahir,
            "gender": dataFrom.gender
        }
    }
    let response = fetch(
        API_URL + "/api/inacbg/ws",
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(databody)
        }
    )
    response = response.json();
    if (response.status == 'success') {
        alert('Data berhasil dikirim');
        window.location.href = '/dashboard/inacbg_klaim';
    } else {
        alert('Gagal mengirim data, silahkan coba lagi');
    }
}