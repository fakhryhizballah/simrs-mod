// // Data response_idrg dari input Anda
// const responseData = {
//     "response_idrg": {
//         "mdc_number": "18",
//         "mdc_description": "Diseases and Disorders of the Musculoskeletal System and Connective Tissue",
//         "drg_code": "1820110",
//         "drg_description": "Humerus, Tibia, Fibula, Ankle Proc. (Age Above 18) w/ No CC",
//         "script_version": "1.0.30",
//         "logic_version": "0.2.1778.202512041107",
//         "cost_weight": "1.61",
//         "sub_acute_weight": "0.00",
//         "chronic_weight": "0.00",
//         "total_cost_weight": "1.61",
//         "nbr": "8,037,060",
//         "status_cd": "final"
//     }
// };
import { getCookieValue, claim } from "./cookie.js";
function formatCurrency(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function formatdate(date) {
    const dateArray = date.split('/');
    const year = dateArray[2];
    const month = dateArray[1];
    const day = dateArray[0];
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
// renderIDRG(responseData);
function renderIDRG(responseData, no_sep) {
    const data = responseData;
    const container = document.getElementById('idrg-container');
    const html = `<div class="max-w-7xl mx-auto px-4 py-8">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <table class="idrg-container w-full border border-[#b5ccb5]">
                        <thead>
                            <tr>
                                <th colspan="3" class="header-cell">Hasil Grouping iDRG - Final</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="label-cell">Info</td>
                                <td class="value-cell" colspan="2">INACBG @ 3 Feb 2026 08:44 - ${data.script_version} / ${data.logic_version}</td>
                            </tr>
                            <tr>
                                <td class="label-cell">Jenis Rawat</td>
                                <td class="value-cell" colspan="2">Rawat Inap (6 Hari)</td>
                            </tr>
                            <tr>
                                <td class="label-cell">MDC</td>
                                <td class="value-cell">${data.mdc_description}</td>
                                <td class="value-cell code-col">${data.mdc_number}</td>
                            </tr>
                            <tr>
                                <td class="label-cell">DRG</td>
                                <td class="value-cell">${data.drg_description}</td>
                                <td class="value-cell code-col">${data.drg_code}</td>
                            </tr>
                            <tr>
                                <td class="label-cell">Cost Weight **)</td>
                                <td class="value-cell" colspan="2">${data.total_cost_weight}</td>
                            </tr>
                            <tr>
                                <td class="label-cell">NBR **)</td>
                                <td class="value-cell" colspan="2">${data.nbr}</td>
                            </tr>
                            <tr>
                                <td class="label-cell">Status</td>
                                <td class="value-cell" colspan="2">${data.status_cd}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p class="footer-note">**) Catatan: Nilai belum final, sewaktu-waktu bisa berubah</p>
                    <div class="mt-4 clearfix">
                        <button class="btn-edit" id="btn-IDRG">FINAL iDRG</button>
                    </div>
                </div>
                
            </div>
            `;
    container.innerHTML = html;

    // Tambahkan event listener untuk tombol
    const buttonEdit = document.getElementById('btn-IDRG');
    if (data.status_cd == "final") {
        buttonEdit.onclick = function () {
            kirimIDRG(no_sep, 'idrg_grouper_reedit');
        };
        buttonEdit.innerHTML = 'Edit Ulang iDRG';
        const submitButton = document.getElementById('submit-button-IDRG');
        if (submitButton) {
            submitButton.remove();
        }
    } else {
        buttonEdit.onclick = function () {
            kirimIDRG(no_sep, 'idrg_grouper_final');
        };
        buttonEdit.innerHTML = 'FINAL iDRG';
        let idrg_diagnosa_set = document.getElementById('idrg_diagnosa_set')
        idrg_diagnosa_set.removeAttribute('disabled')
        let idrg_procedure_set = document.getElementById('idrg_procedure_set')
        idrg_procedure_set.removeAttribute('disabled')
    }
}
async function kirimIDRG(no_sep, method) {
    let databody = {
        "metadata": {
            "method": method
        },
        "data": {
            "nomor_sep": no_sep
        }
    }
    let response = await claim(databody);
    if (response.data.metadata.code == '200') {
        location.reload();
    }
    return response
}

export { renderIDRG, formatdate, kirimIDRG };