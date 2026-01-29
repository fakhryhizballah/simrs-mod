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

    if (inacbg_klaim.bridging_sep.no_sep != '-') {
        kelas_rawat.value = inacbg_klaim.bridging_sep.klsrawat;
    }

    if (inacbg_klaim.status_lanjut == 'Ralan'){
        tgl_masuk.value = new Date(inacbg_klaim.tgl_registrasi).toISOString().slice(0, 16).replace('T', ' ');
        tgl_pulang.value = new Date(inacbg_klaim.tgl_registrasi).toISOString().slice(0, 16).replace('T', ' ');
        nama_dokter.value = inacbg_klaim.dokter.nm_dokter
        let dataRalan = await fetch(
            API_URL + "/api/inacbg/ralan/dpjp?no_rawat=" + inacbg_klaim.no_rawat,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            }
        )
        dataRalan = await dataRalan.json();
        try {
            prosedur_non_bedah.value = dataRalan.data.biaya.totalBiayaNonBedah
            prosedur_bedah.value = dataRalan.data.biaya.prosedur_bedah
            konsultasi.value = dataRalan.data.biaya.konsultasi
            tenaga_ahli.value = dataRalan.data.biaya.tenaga_ahli
            keperawatan.value = dataRalan.data.biaya.keperawatan
            penunjang.value = 0
            radiologi.value = dataRalan.data.biaya.radiologi
            laboratorium.value = dataRalan.data.biaya.laboratorium
            kamar.value = dataRalan.data.biaya.kamar
            obat.value = dataRalan.data.biaya.obat
            alkes.value = dataRalan.data.biaya.sewa_alat
            bmhp.value = dataRalan.data.biaya.bmhp
            if (dataRalan.data.hasilTensi != '-') {
                let dataTensi = dataRalan.data.hasilTensi.split('/')
                sistole.value = dataTensi[0]
                diastole.value = dataTensi[1]
            }

        } catch (error) {

        }
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
    let new_claim = {
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
    await claim(new_claim)
    let set_claim_data = {
        "metadata": {
            "method": "set_claim_data",
            "nomor_sep": dataFrom.nomor_sep
        },
        "data": {
            "nomor_sep": dataFrom.nomor_sep,
            "nomor_kartu": dataFrom.nomor_kartu,
            "tgl_masuk": dataFrom.tgl_masuk,
            "tgl_pulang": dataFrom.tgl_pulang,
            "cara_masuk": dataFrom.cara_masuk,
            "jenis_rawat": dataFrom.jenis_rawat,
            "kelas_rawat": dataFrom.kelas_rawat,
            "adl_sub_acute": dataFrom.adl_sub_acute,
            "adl_chronic": dataFrom.adl_chronic,
            "icu_indikator": dataFrom.icu_indikator,
            "icu_los": dataFrom.icu_los,
            "upgrade_class_ind": dataFrom.upgrade_class_ind,
            "add_payment_pct": 0,
            "add_payment_amt": 0,
            "birth_weight": dataFrom.birth_weight,
            "sistole": dataFrom.sistole,
            "diastole": dataFrom.diastole,
            "discharge_status": dataFrom.discharge_status,
            "tarif_rs": {
                "prosedur_non_bedah": dataFrom.tarif_rs_prosedur_non_bedah,
                "prosedur_bedah": dataFrom.tarif_rs_prosedur_bedah,
                "konsultasi": dataFrom.tarif_rs_konsultasi,
                "tenaga_ahli": dataFrom.tarif_rs_tenaga_ahli,
                "keperawatan": dataFrom.tarif_rs_keperawatan,
                "penunjang": dataFrom.tarif_rs_penunjang,
                "radiologi": dataFrom.tarif_rs_radiologi,
                "laboratorium": dataFrom.tarif_rs_laboratorium,
                "pelayanan_darah": dataFrom.tarif_rs_pelayanan_darah,
                "rehabilitasi": dataFrom.rehabilitasi,
                "kamar": dataFrom.tarif_rs_kamar,
                "rawat_intensif": dataFrom.tarif_rs_rawat_intensif,
                "obat": dataFrom.tarif_rs_obat,
                "obat_kronis": dataFrom.tarif_rs_obat_kronis,
                "obat_kemoterapi": dataFrom.tarif_rs_obat_kemoterapi,
                "alkes": dataFrom.tarif_rs_alkes,
                "bmhp": dataFrom.tarif_rs_bmhp,
                "sewa_alat": dataFrom.tarif_rs_sewa_alat
            },
            "nomor_kartu_t": dataFrom.nomor_kartu_t,
            "dializer_single_use": dataFrom.dializer_single_use,
            "kantong_darah": dataFrom.kantong_darah,
            "alteplase_ind": dataFrom.alteplase_ind,
            "tarif_poli_eks": dataFrom.tarif_poli_eks,
            "nama_dokter": dataFrom.nama_dokter,
            "kode_tarif": dataFrom.kode_tarif,
            "payor_id": 3,
            "payor_cd": dataFrom.payor_cd,
            "cob_cd": "003",
            "coder_nik": coder.nik
        }
    }
    console.log(set_claim_data)
    let set_claim_data_send = await claim(set_claim_data)
    console.log(set_claim_data_send)
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


async function claim(databody) {
    let response = await fetch(
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
    response = await response.json();
    return response
}