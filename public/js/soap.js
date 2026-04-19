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
                tampilkanDummyJikaGagal(); // Tampilkan dummy jika tidak ada data untuk preview
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            loadingRiwayat.classList.add('hidden');
            // Tampilkan data dummy sebagai contoh fallback saat API bermasalah di local
            tampilkanDummyJikaGagal();
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

        // Map keys JSON ke ID Input
        const fields = [
            'no_rawat', 'tgl_perawatan', 'jam_rawat', 'suhu_tubuh', 'tensi',
            'nadi', 'respirasi', 'tinggi', 'berat', 'spo2', 'gcs', 'lingkar_perut',
            'kesadaran', 'keluhan', 'pemeriksaan', 'penilaian', 'rtl',
            'instruksi', 'evaluasi', 'alergi', 'nip'
        ];

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

        // Scroll ke atas (ke arah form)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- Fungsi Reset Form ke Mode Input Baru ---
    async function resetForm() {
        formPemeriksaan.reset();
        setWaktuSekarang();
        document.getElementById('filter-no-rawat').value = await getCache('noRawat', 60 * 60 * 24 * 7);
        document.getElementById('filter-no-rm').value = await getCache('noRm', 60 * 60 * 24 * 7);
        document.getElementById('nip').value = decoded.username;
        btnSimpan.textContent = 'Simpan Data';
        formTitle.textContent = 'Input Data Pemeriksaan (CPPT)';
        formTitle.classList.remove('text-blue-700');
        btnReset.classList.add('hidden');
    }

    // --- Simulasi Data Dummy jika API gagal/kosong (Sesuai permintaan prompt) ---
    function tampilkanDummyJikaGagal() {
        countRiwayat.textContent = "2 Data (Dummy)";
        currentRiwayatData = [
            {
                "no_rawat": "2026/01/03/000024",
                "tgl_perawatan": "2026-01-03",
                "jam_rawat": "08:09:35",
                "suhu_tubuh": "36.4", "tensi": "110/70", "nadi": "82", "respirasi": "18",
                "tinggi": "165", "berat": "60", "spo2": "98", "gcs": "15",
                "kesadaran": "Compos Mentis",
                "keluhan": "pasien kontrol post operasi",
                "pemeriksaan": "luka tampak kering",
                "alergi": "Tidak ada", "lingkar_perut": "",
                "rtl": "managemen perawatan luka",
                "penilaian": "gangguan integritas kulit",
                "instruksi": "Obs ku, ttv\nkaji keadaan luka",
                "evaluasi": "luka tampak kering",
                "nip": "PRBB5",
                "pegawai": { "nama": "LUSIANI MUSTIKA AYU, A.Md.Kep" }
            },
            {
                "no_rawat": "2022/10/13/000157",
                "tgl_perawatan": "2022-10-13",
                "jam_rawat": "13:49:35",
                "suhu_tubuh": "36.4", "tensi": "98/57", "nadi": "84", "respirasi": "22",
                "tinggi": "132", "berat": "31", "spo2": "97", "gcs": "15",
                "kesadaran": "Compos Mentis",
                "keluhan": "Kedua telinga kurang dengar sejak 2 minggu\nSulit bernafas saat tidur\nTidur mendengkur",
                "pemeriksaan": "Klien tampak sering menghela nafas",
                "alergi": "tidak ada", "lingkar_perut": "",
                "rtl": "- Mengkaji keefektifan pola pernafasan klien\n- Kolaborasi Dokter",
                "penilaian": "Ketidakefektifan pola pernafasan",
                "instruksi": "-", "evaluasi": "-",
                "nip": "PRPTHT1",
                "pegawai": { "nama": "dr. CONTOH DOKTER, Sp.THT" }
            }
        ];
        renderRiwayatList(currentRiwayatData);
    }

    // --- Event Listeners ---
    btnCari.addEventListener('click', fetchRiwayat);
    btnReset.addEventListener('click', resetForm);

    btnSimpan.addEventListener('click', function () {
        // Logika untuk submit data (POST/PUT API) diletakkan disini.
        alert('Fitur belum berfungsi.');
        resetForm();
        fetchRiwayat();
    });

    // Init pertama kali
    setWaktuSekarang();
    fetchRiwayat();
});