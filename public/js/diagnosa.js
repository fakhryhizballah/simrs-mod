let API_URL = getCookieValue('API_URL');
let token = getCookieValue('token');
let diagnosaIDRG = [];
// --- LOGIC DIAGNOSA ---
$('#idrg_diagnosa_set').select2({
    ajax: {
        transport: function (params, success, failure) {
            // Select2 provides the query in params.data.q
            const q = (params && params.data && params.data.q) || '';
            if (q === '') {
                return;
            }
            fetch(API_URL + '/api/inacbg/ws', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    "metadata": {
                        "method": "search_diagnosis_inagrouper"
                    }, "data": {
                        "keyword": q
                    }
                })
            })
                .then(response => response.json())
                .then(data => success(data))
                .catch(err => failure(err));
        },
        dataType: 'json',
        delay: 500, // Debounce
        processResults: function (data) {
            // Support responses that wrap results in a `data` property
            const items = data.data.response.data;
            if (items == "EMPTY") {
                return {
                    results: []
                };
            }
            return {
                results: items.map(item => {
                    // Tentukan apakah item harus dinonaktifkan
                    const isDisabled = item.validcode === "0";
                    // const isDisabled2 = item.accpdx === "N";
                    return {
                        id: item.code,
                        text: `${item.description} (${item.code})`,
                        validcode: item.validcode,
                        accpdx: item.accpdx,
                        disabled: isDisabled // Jika true, opsi tidak bisa diklik
                    };
                })
            };
        }

    },
    placeholder: 'Cari Diagnosa...',
    minimumInputLength: 2,
    selectOnClose: true,
    selectOnEnter: true,
}).on('change', function () {
    const selectedData = $(this).select2('data');
    const container = $('#diagnosa-list-container');
    const tableBody = $('#diagnosa-tags');
    console.log(selectedData)
    diagnosaIDRG = [];
    tableBody.empty();
    if (selectedData.length > 0) {
        container.removeClass('hidden');
        selectedData.forEach((item, index) => {
            console.log(index);
            if (index === 0) {
                if (item.accpdx === "Y") {
                    tableBody.append(`
                        <tr>
                            <td class="underline px-4 py-3 font-medium text-gray-700">
                                <span class="text-yellow-800 px-2 py-1 rounded-full">${item.text}</span>
                                <span class="bg-stone-100">${item.id}</span>
                                <span class="text-xs font-semibold text-gray-500 ml-2">Primary</span>
                            </td>
                        </tr>
                    `);
                    diagnosaIDRG.push(item.id);
                } else {
                    Swal.fire({
                        title: '"'+item.id + '" Tidak bisa menjadi diagnosa utama',
                        text: 'Silahkan Ganti Diagnosa utama terlebih dahulu',
                        icon: 'warning',
                        confirmButtonText: 'OK'
                    });
                }
            } else {
                tableBody.append(`
                        <tr>
                            <td class="underline px-4 py-3 font-medium text-gray-700 ">
                                <span data-code="${item.id}" class="text-yellow-800 px-2 py-1 rounded-full">${item.text}</span>
                                <span class="bg-stone-100">${item.id}</span>
                                <span class="text-xs font-semibold text-gray-500 ml-2">Secondary</span>
                            </td>
                        </tr>
                    `);
                diagnosaIDRG.push(item.id);
            }
        });
    }
});
// --- 2. FUNGSI LOAD DEFAULT VALUES ---
async function diagnosa_set(params) {
    const selectEl = $('#idrg_diagnosa_set');
    for (const code of params) {
        try {
            let res = await fetch(API_URL + '/api/inacbg/ws', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    "metadata": { "method": "search_diagnosis_inagrouper" },
                    "data": { "keyword": code }
                })
            });

            const response = await res.json();
            const rawData = response.data.response.data;

            if (rawData !== "EMPTY" && rawData.length > 0) {
                const item = rawData[0];
                const displayText = `${item.description} (${item.code})`;

                // Buat option baru
                const newOption = new Option(displayText, item.code, true, true);

                // Simpan metadata ke elemen agar bisa dibaca di event 'change'
                $(newOption).data('data', {
                    ...item,
                    id: item.code,
                    text: displayText
                });
                selectEl.append(newOption);
            }
        } catch (err) {
            console.error("Error loading default diagnosa:", err);
        }
    }
    selectEl.trigger('change');
}

// Inisialisasi data
let dadig2 = ['A01.0', 'B05.9'];
diagnosa_set(dadig2);


// --- LOGIC PROSEDUR ---
$('#idrg_procedure_set').select2({
    ajax: {
        transport: function (params, success, failure) {
            const q = (params && params.data && params.data.q) || '';
            if (q === '') return;

            fetch(API_URL + '/api/inacbg/ws', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    "metadata": { "method": "search_procedures_inagrouper" },
                    "data": { "keyword": q }
                })
            })
                .then(response => response.json())
                .then(data => success(data))
                .catch(err => failure(err));
        },
        dataType: 'json',
        delay: 500,
        processResults: function (data) {
            const items = data.data.response.data;
            if (items == "EMPTY") return { results: [] };

            return {
                results: items.map(item => ({
                    // PENTING: ID tetap asli di sini
                    id: item.code,
                    text: `${item.description} (${item.code})`,
                    validcode: item.validcode,
                    disabled: item.validcode === "0"
                }))
            };
        }
    },
    placeholder: " Ketik kode atau nama prosedur...",
    minimumInputLength: 2,
    multiple: true,
    width: '100%',
    // TRICK: Izinkan pemilihan item yang sama
    closeOnSelect: true
}).on('select2:selecting', function (e) {
    // Saat user memilih, kita modifikasi ID-nya menjadi unik (Code + Timestamp/Random)
    // Ini memungkinkan item yang sama dipilih berkali-kali
    const data = e.params.args.data;
    const uniqueId = data.id + '_idx_' + Date.now();

    // Buat elemen option baru dengan ID unik agar Select2 mau menerimanya lagi
    const newOption = new Option(data.text, uniqueId, true, true);

    // Simpan kode asli di attribute data agar mudah diambil saat save
    $(newOption).attr('data-original-code', data.id);
    $(newOption).data('full-data', data);

    $(this).append(newOption).trigger('change');

    // Batalkan aksi default agar kita handle secara manual lewat append di atas
    e.preventDefault();
    $(this).select2('close');
}).on('change', function () {
    const selectedData = $(this).select2('data');
    const container = $('#procedure-table-container');
    const tableBody = $('#procedure-list-body');

    // Simpan Qty yang sudah ada berdasarkan Unique ID
    const existingQty = {};
    tableBody.find('input').each(function () {
        existingQty[$(this).attr('data-unique-id')] = $(this).val();
    });

    tableBody.empty();

    if (selectedData.length > 0) {
        container.removeClass('hidden');
        selectedData.forEach(item => {
            // Ambil kode asli (tanpa suffix _idx_...)
            const originalCode = item.id.split('_idx_')[0];
            const val = existingQty[item.id] || 1;

            tableBody.append(`
                <tr>
                    <td class="px-4 py-3 font-medium text-gray-700">
                        ${item.text}
                        <input type="hidden" name="procedure_code[]" value="${originalCode}">
                    </td>
                    <td class="px-4 py-3">
                        <input type="number" 
                               name="procedure_qty[]" 
                               data-unique-id="${item.id}"
                               value="${val}" 
                               min="1" 
                               class="w-20 rounded border-gray-300 p-1 text-center border">
                    </td>
                    <td class="px-4 py-3 text-right">
                        <button type="button" class="text-red-500 hover:text-red-700 remove-proc" data-id="${item.id}">
                             Hapus
                        </button>
                    </td>
                </tr>
            `);
        });
    } else {
        container.addClass('hidden');
    }
});

// Fungsi hapus karena kita pakai ID unik
$(document).on('click', '.remove-proc', function () {
    const id = $(this).data('id');
    const selectEl = $('#idrg_procedure_set');
    const currentVal = selectEl.val();
    const newVal = currentVal.filter(v => v !== id);
    selectEl.val(newVal).trigger('change');
    // Hapus juga option fisiknya agar tidak menumpuk di DOM
    selectEl.find(`option[value="${id}"]`).remove();
});

// --- 2. FUNGSI LOAD DEFAULT VALUES ---
async function procedure_set(data) {
    const selectEl = $('#idrg_procedure_set');

    for (let i = 0; i < data.length; i++) {
        try {
            let res = await fetch(API_URL + '/api/inacbg/ws', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    "metadata": { "method": "search_procedures_inagrouper" },
                    "data": { "keyword": data[i] }
                })
            });

            const response = await res.json();
            const rawData = response.data.response.data;

            if (rawData !== "EMPTY" && rawData.length > 0) {
                const item = rawData[0];
                const displayText = `${item.description} (${item.code})`;

                // PENTING: Gunakan ID Unik yang sama dengan logika selecting
                const uniqueId = item.code + '_idx_' + (Date.now() + i);

                const newOption = new Option(displayText, uniqueId, true, true);

                // Simpan data tambahan
                $(newOption).data('data', {
                    ...item,
                    id: uniqueId,
                    text: displayText
                });

                selectEl.append(newOption);
            }
        } catch (err) {
            console.error("Gagal load prosedur:", err);
        }
    }
    selectEl.trigger('change');
}
procedure_set(["90.599"])


$('#form_diagnosa').submit(function(e) {
    e.preventDefault();
    let procedureIDRG = [];
    $('#procedure-list-body tr').each(function() {
        const code = $(this).find('input[name="procedure_code[]"]').val();
        const qty = $(this).find('input[name="procedure_qty[]"]').val();
        procedureIDRG.push({code, qty});
    });
    console.log(diagnosaIDRG);
    console.log(procedureIDRG);

});
