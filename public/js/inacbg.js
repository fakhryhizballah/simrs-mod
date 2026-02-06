import { getCookieValue, claim } from "./cookie.js";
import { setCache, getCache } from "./indexdb.js";
let API_URL = getCookieValue('API_URL');
let token = getCookieValue('token');
async function inputInacbg(){
    const container = document.getElementById('inacbg-diagnosa-container');
    const html = `<div class="max-w-7xl mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Input Diagnosa & Prosedur INACBG</h2>
          <form id="form_diagnosa_inacbg" class="space-y-8">

            <!-- SEKSI DIAGNOSA -->
            <div class="space-y-4">
                <div class="space-y-2">
                    <label for="incabg_diagnosa_set" class="block text-sm font-semibold text-gray-700">
                        Cari INACBG Diagnosa
                    </label>
                    <select id="incabg_diagnosa_set" name="incabg_diagnosa_set[]" class="w-full" multiple="multiple">
                    </select>
                </div>

                <!-- Hasil List Diagnosa -->
                <div id="diagnosa_inacbg_list_container" class="hidden">
                    <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Diagnosa Terpilih:</h3>
                    <div id="inacbg_diagnosa_tags" class="flex flex-col gap-1">
                        <!-- Rendered by JS -->
                    </div>
                </div>
            </div>

            <hr class="border-gray-100">

            <div class="space-y-4">
                <div class="space-y-2">
                    <label for="incabg_procedure_set" class="block text-sm font-semibold text-gray-700">
                        Cari INACBG Procedure
                    </label>
                    <select id="incabg_procedure_set" name="incabg_procedure_set[]" class="w-full" multiple="multiple">
                    </select>
                </div>

                <!-- Hasil List procedure -->
                <div id="procedure_inacbg_list_container" class="hidden">
                    <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">procedure Terpilih:</h3>
                    <div id="incabg_procedure_tags" class="flex flex-col gap-1">
                        <!-- Rendered by JS -->
                    </div>
                </div>
            </div>

            <div class="pt-6 border-t flex justify-end">
            <div class="mt-4 clearfix">
                <button class="btn-import" id="btn-IMPORT">IMPORT CODING</button>
            </div>
                <div class="mt-4 m-2 clearfix">
                        <button class="btn-edit" id="btn-INACBG">GROUPING INACBG</button>
                    </div>
            </div>
        </form>
    </div>
</div>
            `;
    container.innerHTML = html;
    let diagnosaINACBG = [];
    let procedureINACBG = [];
    $('#incabg_diagnosa_set').select2({
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
        const container = $('#diagnosa_inacbg_list_container');
        const tableBody = $('#inacbg_diagnosa_tags');
        diagnosaINACBG = [];
        tableBody.empty();
        if (selectedData.length > 0) {
            container.removeClass('hidden');
            selectedData.forEach((item, index) => {
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
                        diagnosaINACBG.push(item.id);
                    } else {
                        Swal.fire({
                            title: '"' + item.id + '" Tidak bisa menjadi diagnosa utama',
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
                    diagnosaINACBG.push(item.id);
                }
                
            });
        }
    });
    $('#incabg_procedure_set').select2({
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
                            "method": "search_procedures_inagrouper"
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
        const container = $('#procedure_inacbg_list_container');
        const tableBody = $('#incabg_procedure_tags');
        procedureINACBG = [];
        tableBody.empty();
        if (selectedData.length > 0) {
            container.removeClass('hidden');
            selectedData.forEach((item, index) => {
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
                        procedureINACBG.push(item.id);
                    } else {
                        Swal.fire({
                            title: '"' + item.id + '" Tidak bisa menjadi prosedur utama',
                            text: 'Silahkan Ganti prosedur utama terlebih dahulu',
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
                    procedureINACBG.push(item.id);
                }
               

            });
        }
    });
}
async function inacbg_diagnosa_set(params) {
    const selectEl = $('#incabg_diagnosa_set');
    for (const code of params) {
        try {
            let rawData = await getCache('search_diagnosis_inagrouper:' + code, 60 * 60 * 24 * 7);
            if (!rawData) {
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
                rawData = response.data.response.data;
                setCache('search_diagnosis_inagrouper:' + code, rawData);
            }


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

// inacbg_diagnosa_set(['A01.0', 'B05.9'])

export { inputInacbg, inacbg_diagnosa_set };