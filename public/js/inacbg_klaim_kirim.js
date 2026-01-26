let coder = JSON.parse(sessionStorage.getItem('coder'));
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

    if (inacbg_klaim.bridging_sep.no_sep != '-'){
        console.log(inacbg_klaim.bridging_sep.klsrawat)
        kelas_rawat.value = inacbg_klaim.bridging_sep.klsrawat;
    }

    if (inacbg_klaim.status_lanjut == 'Ralan'){
        tgl_masuk.value = new Date(inacbg_klaim.tgl_registrasi).toISOString().slice(0, 16).replace('T', ' ');
        tgl_pulang.value = new Date(inacbg_klaim.tgl_registrasi).toISOString().slice(0, 16).replace('T', ' ');
        nama_dokter.value = inacbg_klaim.dokter.nm_dokter
    }else{
        
    }
    
    
}
intal()