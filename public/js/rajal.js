import { getCookieValue } from "./cookie.js";
import { setCache, getCache } from "./indexdb.js";
let API_URL = getCookieValue('API_URL');
let token = getCookieValue('token');
let decoded = JSON.parse(getCookieValue('decoded'));
document.addEventListener('DOMContentLoaded', function () {

    // Elemen DOM
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const tableContainer = document.getElementById('data-table-container');
    const tableBody = document.getElementById('table-body');
    const totalPasienEl = document.getElementById('total-pasien');
    const subtitleInfo = document.getElementById('subtitle-info');

    // Elemen Filter
    let dateonly = new Date().toISOString().split('T')[0];
    document.getElementById('date-from').value = dateonly;
    document.getElementById('date-until').value = dateonly;
    const dateFromEl = document.getElementById('date-from');
    const dateUntilEl = document.getElementById('date-until');
    const poliCodeEl = document.getElementById('poli-code');
    const dokterCodeEl = document.getElementById('dokter-code');
    const cariCodeEl = document.getElementById('cari-code');
    const btnFilter = document.getElementById('btn-filter');

    // Variabel untuk menyimpan data asli (sebelum filter pencarian)
    let originalData = [];

    // Fungsi untuk mengambil data daftar poli
    async function fetchPoliList() {
        try {
            const response = await fetch(API_URL + '/api/ralan/poli', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });
            
            if (!response.ok) throw new Error('Network response was not ok');

            const result = await response.json();

            if (result.status && result.data) {
                poliCodeEl.innerHTML = ''; // Bersihkan opsi loading

                result.data.forEach(item => {
                    // Abaikan data yang memiliki kode atau nama poli "-"
                    if (item.kd_poli !== '-' && item.nm_poli !== '-') {
                        const option = document.createElement('option');
                        option.value = item.kd_poli;
                        option.textContent = item.nm_poli;

                        // // Set default pilihan ke Poli Anak (ANA) jika ada
                        // if (item.kd_poli === 'ANA') {
                        //     option.selected = true;
                        // }

                        poliCodeEl.appendChild(option);
                    }
                });
            }
        } catch (error) {
            console.error('Error fetching poli list:', error);
            // Fallback option jika gagal memuat dari API
            poliCodeEl.innerHTML = '<option value="ANA">Poli Anak (Default)</option>';
        }
    }


    async function fetchDokterList() {
        try {
            const response = await fetch(API_URL + '/api/petugas/dokter?limit=100&search=', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const result = await response.json();

            if (result.status && result.data) {
                dokterCodeEl.innerHTML = ''; // Bersihkan opsi loading
                result.data.forEach(item => {
                    if (item.kd_dokter == decoded.username) {
                        const option = document.createElement('option');
                        option.value = item.kd_dokter;
                        option.textContent = item.nm_dokter;
                        option.selected = true;
                        dokterCodeEl.appendChild(option);
                    } else {
                        const option = document.createElement('option');
                        option.value = item.kd_dokter;
                        option.textContent = item.nm_dokter;
                        dokterCodeEl.appendChild(option);
                    };

                })
            }
        } catch (error) {
            console.error('Error fetching poli list:', error);
            // Fallback option jika gagal memuat dari API
            dokterCodeEl.innerHTML = '<option value="-">-</option>';
        }
    }

    // Fungsi untuk mengambil data tabel pasien
    async function fetchData() {
        // Pastikan ada pilihan yang terpilih (jika fetch poli masih berjalan atau gagal)
        if (!poliCodeEl.value) return;

        // Ambil nilai dari input filter
        const fromDate = dateFromEl.value;
        const untilDate = dateUntilEl.value;
        const poliCode = poliCodeEl.value;
        const poliName = poliCodeEl.options[poliCodeEl.selectedIndex].text;
        const dokterCode = dokterCodeEl.value;

        // Susun URL API secara dinamis berdasarkan filter
        const apiUrl = `/api/ralan/poli/${poliCode}?from=${fromDate}&until=${untilDate}&kd_dokter=${dokterCode}`;

        // Perbarui subtitle
        subtitleInfo.textContent = `${poliName} - Tanggal: ${fromDate} s/d ${untilDate}`;

        // Reset tampilan sebelum fetch
        loadingState.classList.remove('hidden');
        errorState.classList.add('hidden');
        tableContainer.classList.add('hidden');
        totalPasienEl.textContent = '0';
        tableBody.innerHTML = '';

        try {
            const response = await fetch(API_URL + apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Sembunyikan loading
            loadingState.classList.add('hidden');

            if (result.status && result.data) {
                // Tampilkan tabel
                tableContainer.classList.remove('hidden');

                // Update jumlah rekor
                totalPasienEl.textContent = result.record;

                // Simpan data asli untuk filtering
                originalData = result.data;

                // Reset input pencarian
                cariCodeEl.value = '';

                // Render baris tabel
                renderTable(result.data);
            } else {
                throw new Error(result.message || 'Format data tidak sesuai');
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            // Sembunyikan loading, tampilkan error
            loadingState.classList.add('hidden');
            errorState.classList.remove('hidden');

            // Menampilkan alert opsional menggunakan SweetAlert2
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Gagal mengambil data pasien dari server!',
            });
        }
    }

    // Fungsi untuk merender HTML baris tabel
    function renderTable(dataArray) {
        tableBody.innerHTML = ''; // Kosongkan isi tabel sebelumnya

        if (dataArray.length === 0) {
            tableBody.innerHTML = `
                        <tr>
                            <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                                Tidak ada data pasien untuk pencarian tersebut.
                            </td>
                        </tr>
                    `;
            return;
        }

        dataArray.forEach(item => {
            // Penentuan warna badge jenis kelamin
            const jkBadge = item.pasien.jk === 'L'
                ? '<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-600">L</span>'
                : '<span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-pink-100 text-pink-600">P</span>';

            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-colors duration-150';
            row.addEventListener('click', () => {
                handlePatientClick(item.no_rawat, item.pasien.no_rkm_medis, item.pasien.nm_pasien);
            });
            let noSEP = '-';
            if (item.bridging_sep !== null) {
                noSEP = item.bridging_sep.no_sep;
            }

            row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            ${item.no_rawat}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            <div class="flex flex-col">
                                <span>${item.jam_reg}</span>
                                <span class="text-xs text-stone-700/50">${item.tgl_registrasi}</span>
                            </div>
                        </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                             ${noSEP}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex flex-col">
                                <div class="text-sm font-medium text-gray-900">${item.pasien.nm_pasien}</div>
                                <span class="text-xs text-stone-700/80">${item.pasien.no_rkm_medis}</span>
                            </div>
                            
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                            ${jkBadge}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${item.pasien.tgl_lahir}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                ${item.dokter.nm_dokter}
                            </div>
                        </td>
                    `;

            tableBody.appendChild(row);
        });
    }

    // Fungsi untuk filter data berdasarkan pencarian nama atau RM
    function filterTableBySearch(searchTerm) {
        if (!searchTerm.trim()) {
            // Jika search kosong, tampilkan semua data asli
            renderTable(originalData);
            totalPasienEl.textContent = originalData.length;
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        const filteredData = originalData.filter(item => {
            const nmPasien = item.pasien.nm_pasien.toLowerCase();
            const noRm = item.pasien.no_rkm_medis.toLowerCase();
            return nmPasien.includes(searchLower) || noRm.includes(searchLower);
        });

        renderTable(filteredData);
        totalPasienEl.textContent = filteredData.length;
    }

    // Event listener untuk pencarian real-time
    cariCodeEl.addEventListener('input', function () {
        filterTableBySearch(this.value);
    });

    // Event listener untuk tombol filter
    btnFilter.addEventListener('click', fetchData);

    // Fungsi Inisialisasi: Tunggu daftar poli dimuat, baru load data tabel
    async function init() {
        await fetchPoliList();
        await fetchDokterList();
        fetchData();
    }

    // Panggil inisialisasi saat halaman selesai dimuat
    init();
});


window.handlePatientClick = await function (noRawat, noRm, namapx) {
    console.log('Parameter diterima:', { noRawat, noRm });
    let dKode_poli = document.getElementById('poli-code').value;
    console.log('Parameter diterima:', { dKode_poli });
    // Menampilkan alert informasi dengan parameter
    setCache('noRawat', noRawat);
    setCache('noRm', noRm);
    setCache('kdPoli', dKode_poli);
    setCache('namapx', namapx);

    // Swal.fire({
    //     icon: 'info',
    //     title: 'Aksi Diklik!',
    //     html: `Anda memilih pasien dengan:<br><br><b>No. Rawat:</b> ${noRawat}<br><b>No. RM:</b> ${noRm},<br><b>Kode Poli:</b> ${dKode_poli}`,
    //     confirmButtonText: 'Tutup',
    //     confirmButtonColor: '#3b82f6'
    // });
 
    // --- Contoh jika ingin melakukan pengalihan (redirect) halaman ---
    window.location.href = `/rajal/soap`;
};
