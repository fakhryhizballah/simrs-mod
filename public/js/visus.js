import { getCookieValue } from "./cookie.js";
import { setCache, getCache } from "./indexdb.js";

let API_URL = getCookieValue('API_URL');
let token = getCookieValue('token');
let decoded = JSON.parse(getCookieValue('decoded'));
let sessionStorage = window.sessionStorage;
let dataSOAP = JSON.parse(sessionStorage.getItem('SOAP'));

if (dataSOAP) {
    console.log(dataSOAP);
    document.getElementById('filter-no-rawat').value = dataSOAP.no_rawat;
    document.getElementById('filter-no-rm').value = dataSOAP.no_rm;
    document.getElementById('filter-nama').value = dataSOAP.nama;
    document.getElementById('filter-kd-poli').value = dataSOAP.kd_poli;
    document.getElementById('save-button').innerHTML = 'Update';
}

document.getElementById('filter-no-rawat').value = await getCache('noRawat', 60 * 60 * 24 * 7);
document.getElementById('filter-no-rm').value = await getCache('noRm', 60 * 60 * 24 * 7);
document.getElementById('filter-nama').value = await getCache('namapx', 60 * 60 * 24 * 7);
document.getElementById('filter-kd-poli').value = await getCache('kdPoli', 60 * 60 * 24 * 7);

const inputFilterNoRawat = document.getElementById('filter-no-rawat');
const inputFilterNoRm = document.getElementById('filter-no-rm');
const selectFilterStatus = document.getElementById('filter-status');
const inputFilterKdPoli = document.getElementById('filter-kd-poli');

console.log(decoded.username);
const odCylInput = document.getElementById('od-cyl');
const odAxisInput = document.getElementById('od-axis');
const osCylInput = document.getElementById('os-cyl');
const osAxisInput = document.getElementById('os-axis');

function toggleAxisDisabled(cylInput, axisInput, ringColorClass) {
    const val = parseFloat(cylInput.value);
    const isDisabled = cylInput.value.trim() === '' || isNaN(val) || val === 0;

    if (isDisabled) {
        axisInput.setAttribute('disabled', 'true');
        axisInput.value = '';
        axisInput.className = "w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/40 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none transition-all";
    } else {
        axisInput.removeAttribute('disabled');
        axisInput.className = `w-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 ${ringColorClass} focus:bg-white/20 transition-all`;
    }
}

odCylInput.addEventListener('input', () => toggleAxisDisabled(odCylInput, odAxisInput, 'focus:ring-red-400'));
osCylInput.addEventListener('input', () => toggleAxisDisabled(osCylInput, osAxisInput, 'focus:ring-blue-400'));

// Init state saat pertama kali load
toggleAxisDisabled(odCylInput, odAxisInput, 'focus:ring-red-400');
toggleAxisDisabled(osCylInput, osAxisInput, 'focus:ring-blue-400');

function getRefraksiSummaryString() {
    const getValue = (id) => {
        const el = document.getElementById(id);
        return el && el.value.trim() !== '' ? el.value.trim() : null;
    };

    const getEyeString = (prefix, visusDasarId, sphId, cylId, axisId, visusId, addId, prismBarId) => {
        const data = [];
        const visusDasar = getValue(visusDasarId);
        const sph = getValue(sphId);
        const cyl = getValue(cylId);
        const axis = getValue(axisId);
        const visus = getValue(visusId);
        const add = getValue(addId);
        const prismBar = getValue(prismBarId);

        if (visusDasar) data.push(`VD:${visusDasar}`);
        if (sph) data.push(`SPH:${sph}`);
        if (cyl) data.push(`CYL:${cyl}`);
        if (axis && cyl && parseFloat(cyl) !== 0) data.push(`AXIS:${axis}`);
        if (visus) data.push(`NC:${visus}`);
        if (add) data.push(`ADD:${add}`);
        if (prismBar) data.push(`PRISM:${prismBar}`);

        return data.length > 0 ? `${prefix} [${data.join(' ')}]` : null;
    };

    const odStr = getEyeString('OD', 'od-visus-dasar', 'od-sph', 'od-cyl', 'od-axis', 'od-visus-cc', 'od-add', 'od-prism-bar');
    const osStr = getEyeString('OS', 'os-visus-dasar', 'os-sph', 'os-cyl', 'os-axis', 'os-visus-cc', 'os-add', 'os-prism-bar');
    const pd = getValue('pd-input');

    // Tonometri & Buta Warna
    const tonoOd = getValue('tonometri-od');
    const tonoOs = getValue('tonometri-os');
    const colorBlindnessVal = getValue('color-blindness');

    const parts = [];
    if (odStr) parts.push(odStr);
    if (osStr) parts.push(osStr);
    if (pd) parts.push(`PD:${pd}`);

    if (tonoOd || tonoOs) {
        const tonoData = [];
        if (tonoOd) tonoData.push(`OD:${tonoOd}`);
        if (tonoOs) tonoData.push(`OS:${tonoOs}`);
        parts.push(`TONO [${tonoData.join(' ')}]`);
    }

    // Hanya ditambahkan jika diisi / tidak kosong
    if (colorBlindnessVal) {
        parts.push(`BW:${colorBlindnessVal}`);
    }

    return parts.join(' | ');
}

function parseEyeDetails(text) {
    const data = { visusDasar: '', sph: '', cyl: '', axis: '', visusCc: '', add: '', prismBar: '' };

    const visusDasarMatch = text.match(/VD:([\w\/.]+)/i);
    const sphMatch = text.match(/SPH:([+-]?[\d.]+)/i);
    const cylMatch = text.match(/CYL:([+-]?[\d.]+)/i);
    const axisMatch = text.match(/AXIS:([\d.]+)/i);
    const visusMatch = text.match(/NC:([\w\/.]+)/i);
    const addMatch = text.match(/ADD:([+-]?[\d.]+)/i);
    const prismMatch = text.match(/PRISM:([\w\d.∆]+)/i);

    if (visusDasarMatch) data.visusDasar = visusDasarMatch[1];
    if (sphMatch) data.sph = sphMatch[1];
    if (cylMatch) data.cyl = cylMatch[1];
    if (axisMatch) data.axis = axisMatch[1];
    if (visusMatch) data.visusCc = visusMatch[1];
    if (addMatch) data.add = addMatch[1];
    if (prismMatch) data.prismBar = prismMatch[1];

    return data;
}

function parseRefraksiString(str) {
    const result = {
        od: { visusDasar: '', sph: '', cyl: '', axis: '', visusCc: '', add: '', prismBar: '' },
        os: { visusDasar: '', sph: '', cyl: '', axis: '', visusCc: '', add: '', prismBar: '' },
        pd: '',
        tonometri: { od: '', os: '' },
        colorBlindness: ''
    };

    if (!str || typeof str !== 'string') return result;

    const sections = str.split('|').map(s => s.trim());

    sections.forEach(section => {
        const odMatch = section.match(/^OD\s*\[(.*?)\]$/i);
        const osMatch = section.match(/^OS\s*\[(.*?)\]$/i);
        const pdMatch = section.match(/^PD:([\d.]+)/i);
        const tonoMatch = section.match(/^TONO\s*\[(.*?)\]$/i);
        const bwMatch = section.match(/^BW:(\w+)/i);

        if (odMatch) {
            result.od = parseEyeDetails(odMatch[1]);
        } else if (osMatch) {
            result.os = parseEyeDetails(osMatch[1]);
        } else if (pdMatch) {
            result.pd = pdMatch[1];
        } else if (tonoMatch) {
            const tonoOdMatch = tonoMatch[1].match(/OD:([\d.]+)/i);
            const tonoOsMatch = tonoMatch[1].match(/OS:([\d.]+)/i);
            if (tonoOdMatch) result.tonometri.od = tonoOdMatch[1];
            if (tonoOsMatch) result.tonometri.os = tonoOsMatch[1];
        } else if (bwMatch) {
            result.colorBlindness = bwMatch[1];
        }
    });

    return result;
}

function populateRefraksiForm(refraksiString) {
    const parsedData = parseRefraksiString(refraksiString);

    const fieldMap = {
        'od-visus-dasar': parsedData.od.visusDasar,
        'od-sph': parsedData.od.sph,
        'od-cyl': parsedData.od.cyl,
        'od-axis': parsedData.od.axis,
        'od-visus-cc': parsedData.od.visusCc,
        'od-add': parsedData.od.add,
        'od-prism-bar': parsedData.od.prismBar,

        'os-visus-dasar': parsedData.os.visusDasar,
        'os-sph': parsedData.os.sph,
        'os-cyl': parsedData.os.cyl,
        'os-axis': parsedData.os.axis,
        'os-visus-cc': parsedData.os.visusCc,
        'os-add': parsedData.os.add,
        'os-prism-bar': parsedData.os.prismBar,

        'pd-input': parsedData.pd,
        'tonometri-od': parsedData.tonometri.od,
        'tonometri-os': parsedData.tonometri.os,
        'color-blindness': parsedData.colorBlindness
    };

    Object.keys(fieldMap).forEach(id => {
        const inputEl = document.getElementById(id);
        if (inputEl) {
            inputEl.value = fieldMap[id] || '';
        }
    });

    ['od-cyl', 'os-cyl'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.dispatchEvent(new Event('input'));
    });

    return parsedData;
}

function getRefraksiStandardString() {
    const getValue = (id) => {
        const el = document.getElementById(id);
        return el && el.value.trim() !== '' ? el.value.trim() : null;
    };

    const formatEyeData = (prefix, visusDasarId, sphId, cylId, axisId, visusId, addId, prismBarId) => {
        const visusDasar = getValue(visusDasarId);
        const sph = getValue(sphId);
        const cyl = getValue(cylId);
        const axis = getValue(axisId);
        const visus = getValue(visusId);
        const add = getValue(addId);
        const prismBar = getValue(prismBarId);

        if (!visusDasar && !sph && !cyl && !visus && !add && !prismBar) return null;

        const parts = [];
        if (visusDasar) parts.push(`VD ${visusDasar}`);
        if (sph) parts.push(`SPH ${sph}`);
        if (cyl) {
            parts.push(`CYL ${cyl}`);
            if (axis) parts.push(`x ${axis}°`);
        }
        if (visus) parts.push(`V ${visus}`);
        if (add) parts.push(`ADD ${add}`);
        if (prismBar) parts.push(`PRISM ${prismBar}`);

        return `${prefix}: ${parts.join(' ')}`;
    };

    const odString = formatEyeData('OD', 'od-visus-dasar', 'od-sph', 'od-cyl', 'od-axis', 'od-visus-cc', 'od-add', 'od-prism-bar');
    const osString = formatEyeData('OS', 'os-visus-dasar', 'os-sph', 'os-cyl', 'os-axis', 'os-visus-cc', 'os-add', 'os-prism-bar');
    const pd = getValue('pd-input');

    // Tonometri
    const tonoOd = getValue('tonometri-od');
    const tonoOs = getValue('tonometri-os');

    // Buta Warna Check: Hanya ambil text jika value tidak kosong
    const colorBlindnessVal = getValue('color-blindness');
    let colorBlindnessText = null;
    if (colorBlindnessVal) {
        const colorBlindnessEl = document.getElementById('color-blindness');
        if (colorBlindnessEl && colorBlindnessEl.selectedIndex !== -1) {
            colorBlindnessText = colorBlindnessEl.options[colorBlindnessEl.selectedIndex].text;
        }
    }

    const result = [];
    if (odString) result.push(odString);
    if (osString) result.push(osString);
    if (pd) result.push(`PD ${pd}mm`);

    if (tonoOd || tonoOs) {
        const tonoParts = [];
        if (tonoOd) tonoParts.push(`OD ${tonoOd} mmHg`);
        if (tonoOs) tonoParts.push(`OS ${tonoOs} mmHg`);
        result.push(`Tio: ${tonoParts.join(', ')}`);
    }

    // Hanya masukan ke string jika ada pemeriksaan buta warna yang dipilih
    if (colorBlindnessText) {
        result.push(`Tes Buta Warna: ${colorBlindnessText}`);
    }

    return result.join(' | ');
}

document.getElementById('save-button').addEventListener('click', async () => {
    const summaryString = getRefraksiSummaryString();
    const standardString = getRefraksiStandardString();
    const parsedData = populateRefraksiForm(summaryString);

    console.log('Output String Refraksi:', summaryString);
    console.log('Parsed JSON Object:', parsedData);
    console.log('Standard String:', standardString);

    let tgl_perawatan = new Date().toISOString().split('T')[0];
    let jam_rawat = new Date().toTimeString().split(' ')[0];

    let dataSOAP = JSON.parse(sessionStorage.getItem('SOAP'));

    const showToast = (icon, title) => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
        Toast.fire({ icon, title });
    };

    if (dataSOAP) {
        let data = {
            no_rawat: inputFilterNoRawat.value,
            nip: decoded.username,
            pemeriksaan: standardString,
            kesadaran: dataSOAP.kesadaran,
            tgl_perawatan: dataSOAP.tgl_perawatan,
            jam_rawat: dataSOAP.jam_rawat,
            keluhan: dataSOAP.keluhan,
            alergi: dataSOAP.alergi,
            penilaian: dataSOAP.penilaian,
            instruksi: dataSOAP.instruksi,
            tensi: dataSOAP.tensi,
            spo2: dataSOAP.spo2,
            nadi: dataSOAP.nadi,
            gcs: dataSOAP.gcs,
            rtl: dataSOAP.rtl,
            respirasi: dataSOAP.respirasi,
            tinggi: dataSOAP.tinggi,
            berat: dataSOAP.berat,
            suhu_tubuh: dataSOAP.suhu_tubuh,
            evaluasi: dataSOAP.evaluasi
        };

        try {
            let simpandata = await fetch(API_URL + '/api/ralan/pemeriksaan', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            });
            simpandata = await simpandata.json();
            if (simpandata.status === true) {
                showToast('success', 'Data diupdate');
            } else {
                showToast('error', 'Data gagal diupdate');
            }
        } catch (err) {
            console.error(err);
            showToast('error', 'Terjadi kesalahan sistem');
        }

    } else {
        let data = {
            no_rawat: inputFilterNoRawat.value,
            nip: decoded.username,
            pemeriksaan: standardString,
            kesadaran: "Compos Mentis",
            tgl_perawatan: tgl_perawatan,
            jam_rawat: jam_rawat,
            keluhan: '-',
            alergi: '-',
            penilaian: '-',
            instruksi: '-',
            tensi: '-',
            spo2: '99',
            nadi: '-',
            gcs: '15',
            rtl: '-',
            respirasi: '-',
            tinggi: '-',
            berat: '-',
            suhu_tubuh: '-',
            evaluasi: '-'
        };

        try {
            let simpandata = await fetch(API_URL + '/api/ralan/pemeriksaan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            });
            simpandata = await simpandata.json();
            if (simpandata.status === true) {
                showToast('success', 'Data Berhasil Disimpan');
            } else {
                showToast('error', 'Data Gagal Disimpan');
            }
        } catch (err) {
            console.error(err);
            showToast('error', 'Terjadi kesalahan sistem');
        }
    }
});