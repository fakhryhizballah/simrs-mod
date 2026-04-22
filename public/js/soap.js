import { getCookieValue } from "./cookie.js";
import { setCache, getCache } from "./indexdb.js";
let API_URL = getCookieValue('API_URL');
let token = getCookieValue('token');
let decoded = JSON.parse(getCookieValue('decoded'));
console.log(decoded.username)

document.addEventListener('DOMContentLoaded',async function () {
    console.log(await getCache('noRawat', 60 * 60 * 24 * 7));
    // --- Referensi Elemen DOM ---
    // Filter
 document.getElementById('filter-no-rawat').value = await getCache('noRawat', 60 * 60 * 24 * 7);
 document.getElementById('filter-no-rm').value = await getCache('noRm', 60 * 60 * 24 * 7);
 document.getElementById('filter-nama').value = await getCache('namapx', 60 * 60 * 24 * 7);
 document.getElementById('filter-kd-poli').value = await getCache('kdPoli', 60 * 60 * 24 * 7);
    document.getElementById('nip').value = decoded.username;
    document.getElementById('nama_pegawai').value = decoded.fullname;
    const inputFilterNoRawat = document.getElementById('filter-no-rawat');
    const inputFilterNoRm = document.getElementById('filter-no-rm')
    const selectFilterStatus = document.getElementById('filter-status');
    const inputFilterKdPoli = document.getElementById('filter-kd-poli');
    const btnCari = document.getElementById('btn-cari');

    // Form
    const formPemeriksaan = document.getElementById('form-pemeriksaan');
    const formTitle = document.getElementById('form-title');
    const btnReset = document.getElementById('btn-reset');
    const btnSimpan = document.getElementById('btn-simpan');

    // List Riwayat
    const containerList = document.getElementById('list-riwayat');
    const loadingRiwayat = document.getElementById('loading-riwayat');
    const countRiwayat = document.getElementById('count-riwayat');

    // State global untuk menampung data riwayat saat ini
    let currentRiwayatData = [];

    // --- Fungsi Format Waktu Saat Ini ---
    function setWaktuSekarang() {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const sec = String(now.getSeconds()).padStart(2, '0');

        document.getElementById('tgl_perawatan').value = `${yyyy}-${mm}-${dd}`;
        document.getElementById('jam_rawat').value = `${hh}:${min}:${sec}`;
        document.getElementById('no_rawat').value = inputFilterNoRawat.value;
    }

    // --- Fungsi Ambil Data Riwayat ---
    async function fetchRiwayat() {
        const noRawat = encodeURIComponent(inputFilterNoRawat.value);
        const noRm = encodeURIComponent(inputFilterNoRm.value);
        const statusLanjut = encodeURIComponent(selectFilterStatus.value);
        const kdPoli = encodeURIComponent(inputFilterKdPoli.value);

        const apiUrl = `${API_URL}/api/ralan/pemeriksaan/riwayat?no_rawat=${noRawat}&no_rkm_medis=${noRm}&status_lanjut=${statusLanjut}&kd_poli=${kdPoli}`;

        // Reset UI State
        containerList.innerHTML = '';
        loadingRiwayat.classList.remove('hidden');
        countRiwayat.textContent = 'Memuat...';

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });
            const result = await response.json();

            loadingRiwayat.classList.add('hidden');

            if (result.status && result.data && result.data.length > 0) {
                currentRiwayatData = result.data;
                countRiwayat.textContent = `${result.record} x kunjungan`;
                renderRiwayatList(currentRiwayatData);
            } else {
                currentRiwayatData = [];
                countRiwayat.textContent = '0 kunjungan';
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            loadingRiwayat.classList.add('hidden');
        }
    }

    // --- Fungsi Render HTML List Riwayat ---
    function renderRiwayatList(data) {
        containerList.innerHTML = '';

        data.forEach((item, index) => {
            // Buat badges untuk vital sign jika ada isinya
            let badgesHTML = '';
            if (item.tensi) badgesHTML += `<span class="bg-red-100 text-red-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-red-200">TD: ${item.tensi}</span>`;
            if (item.suhu_tubuh) badgesHTML += `<span class="bg-orange-100 text-orange-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-orange-200">Suhu: ${item.suhu_tubuh}°C</span>`;
            if (item.nadi) badgesHTML += `<span class="bg-pink-100 text-pink-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-pink-200">HR: ${item.nadi}</span>`;
            if (item.spo2) badgesHTML += `<span class="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200">SpO2: ${item.spo2}%</span>`;

            const card = document.createElement('div');
            card.className = 'bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden';

            card.innerHTML = `
                    <div class="bg-blue-50/50 px-3 py-2 border-b border-gray-100 flex justify-between items-start">
                        <div>
                            <div class="text-xs font-bold text-gray-800">${item.tgl_perawatan} <span class="text-gray-500 font-normal">| ${item.jam_rawat}</span></div>
                            <div class="text-[11px] text-gray-600 mt-0.5 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                ${item.pegawai?.nama || item.nip}
                            </div>
                        </div>
                        <button onclick="editPemeriksaan(${index})" class="text-xs bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-2 py-1 rounded shadow-sm transition">
                            Edit
                        </button>
                    </div>
                    <div class="p-3">
                        <div class="flex flex-wrap gap-1.5 mb-2">${badgesHTML}</div>
                        <div class="space-y-1.5 text-xs text-gray-700">
                            ${item.keluhan ? `<p><strong class="text-gray-900">S:</strong> ${item.keluhan.replace(/\n/g, '<br>')}</p>` : ''}
                            ${item.pemeriksaan ? `<p><strong class="text-gray-900">O:</strong> ${item.pemeriksaan.replace(/\n/g, '<br>')}</p>` : ''}
                            ${item.penilaian ? `<p><strong class="text-gray-900">A:</strong> ${item.penilaian.replace(/\n/g, '<br>')}</p>` : ''}
                            ${item.rtl ? `<p><strong class="text-gray-900">P:</strong> ${item.rtl.replace(/\n/g, '<br>')}</p>` : ''}
                        </div>
                    </div>
                `;
            containerList.appendChild(card);
        });
    }

    // --- Fungsi Edit Form (Di-trigger dari tombol Edit di List) ---
    window.editPemeriksaan = function (index) {
        const data = currentRiwayatData[index];
        if (!data) return;
        if (data.nip !== decoded.username) {
            Swal.fire({
                title: 'Konfirmasi',
                text: 'Apakah Anda ingin meniru CPPT ' + data.pegawai.nama + '?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Tiru!'
            }).then((result) => {
                if (result.isConfirmed) {
                    const fields = [
                        'suhu_tubuh', 'tensi', 'nadi', 'respirasi', 'tinggi', 'berat', 'spo2', 'gcs', 'lingkar_perut',
                        'kesadaran', 'keluhan', 'pemeriksaan', 'penilaian', 'rtl',
                        'instruksi', 'evaluasi', 'alergi'
                    ];

                    fields.forEach(field => {
                        const el = document.getElementById(field);
                        if (el) {
                            el.value = data[field] || '';
                        }
                    });
                    return;
                    // updatePemeriksaan(data);
                };
                if (result.isDismissed) {
                    return;
                    // updatePemeriksaan(data);
                };
            });
        } else {
            // Map keys JSON ke ID Input
            const fields = [
                'no_rawat', 'tgl_perawatan', 'jam_rawat', 'suhu_tubuh', 'tensi',
                'nadi', 'respirasi', 'tinggi', 'berat', 'spo2', 'gcs', 'lingkar_perut',
                'kesadaran', 'keluhan', 'pemeriksaan', 'penilaian', 'rtl',
                'instruksi', 'evaluasi', 'alergi', 'nip'
            ];
            document.getElementById('status').value = 1;

            fields.forEach(field => {
                const el = document.getElementById(field);
                if (el) {
                    el.value = data[field] || '';
                }
            });

            // Ubah tampilan UI Form
            formTitle.textContent = 'Edit Data Pemeriksaan';
            formTitle.classList.add('text-blue-700');
            btnReset.classList.remove('hidden');
            btnSimpan.textContent = 'Simpan Perubahan';
            document.getElementById('status').value = 0;

            // Scroll ke atas (ke arah form)
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

    };

    // --- Fungsi Reset Form ke Mode Input Baru ---
    async function resetForm() {
        formPemeriksaan.reset();
        setWaktuSekarang();
        document.getElementById('filter-no-rawat').value = await getCache('noRawat', 60 * 60 * 24 * 7);
        document.getElementById('filter-no-rm').value = await getCache('noRm', 60 * 60 * 24 * 7);
        document.getElementById('nip').value = decoded.username;
        document.getElementById('nama_pegawai').value = decoded.fullname;
        btnSimpan.textContent = 'Simpan Data';
        formTitle.textContent = 'Input Data Pemeriksaan (CPPT)';
        document.getElementById('status').value = 1;
        formTitle.classList.remove('text-blue-700');
        btnReset.classList.add('hidden');
    }

    // --- Event Listeners ---
    btnCari.addEventListener('click', fetchRiwayat);
    btnReset.addEventListener('click', resetForm);

    btnSimpan.addEventListener('click', async function () {
        const formData = new FormData(formPemeriksaan);
        if (!formPemeriksaan.reportValidity()) {
            formPemeriksaan.classList.add('was-validated');
            return;
        }
        // Logika untuk submit data (POST/PUT API) diletakkan disini.
        let status = document.getElementById('status').value;
        let data = {
            "no_rawat": document.getElementById('no_rawat').value,
            "tgl_perawatan": document.getElementById('tgl_perawatan').value,
            "jam_rawat": document.getElementById('jam_rawat').value,
            "suhu_tubuh": document.getElementById('suhu_tubuh').value,
            "tensi": document.getElementById('tensi').value,
            "nadi": document.getElementById('nadi').value,
            "respirasi": document.getElementById('respirasi').value,
            "tinggi": document.getElementById('tinggi').value,
            "berat": document.getElementById('berat').value,
            "spo2": document.getElementById('spo2').value,
            "gcs": document.getElementById('gcs').value,
            "kesadaran": document.getElementById('kesadaran').value,
            "keluhan": document.getElementById('keluhan').value,
            "pemeriksaan": document.getElementById('pemeriksaan').value,
            "alergi": document.getElementById('alergi').value,
            "lingkar_perut": document.getElementById('lingkar_perut').value,
            "rtl": document.getElementById('rtl').value,
            "penilaian": document.getElementById('penilaian').value,
            "instruksi": document.getElementById('instruksi').value,
            "evaluasi": document.getElementById('evaluasi').value,
            "nip": decoded.username
        }
        if (status == 1) {
            let simpandata = await fetch(API_URL + '/api/ralan/pemeriksaan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            })
            simpandata = await simpandata.json();
            if (simpandata.status == 200) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })
                Toast.fire({
                    icon: 'success',
                    title: 'Data Berhasil Disimpan'
                })
            }

        } else if (status == 0) {
            let updateData = await fetch(API_URL + '/api/ralan/pemeriksaan', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            })
            updateData = await updateData.json();
            if (updateData.status == 200) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })
                Toast.fire({
                    icon: 'success',
                    title: 'Data Berhasil Diupdate'
                })
            }

        }
        resetForm();
        fetchRiwayat();
    });

    // Init pertama kali
    setWaktuSekarang();
    fetchRiwayat();
});