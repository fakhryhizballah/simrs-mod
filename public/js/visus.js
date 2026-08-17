import { getCookieValue } from "./cookie.js";
import { setCache, getCache } from "./indexdb.js";
let API_URL = getCookieValue('API_URL');
let token = getCookieValue('token');
let decoded = JSON.parse(getCookieValue('decoded'));

document.getElementById('filter-no-rawat').value = await getCache('noRawat', 60 * 60 * 24 * 7);
document.getElementById('filter-no-rm').value = await getCache('noRm', 60 * 60 * 24 * 7);
document.getElementById('filter-nama').value = await getCache('namapx', 60 * 60 * 24 * 7);
document.getElementById('filter-kd-poli').value = await getCache('kdPoli', 60 * 60 * 24 * 7);
const inputFilterNoRawat = document.getElementById('filter-no-rawat');
const inputFilterNoRm = document.getElementById('filter-no-rm')
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

    const getEyeString = (prefix, sphId, cylId, axisId, visusId, addId) => {
        const data = [];
        const sph = getValue(sphId);
        const cyl = getValue(cylId);
        const axis = getValue(axisId);
        const visus = getValue(visusId);
        const add = getValue(addId);

        if (sph) data.push(`SPH:${sph}`);
        if (cyl) data.push(`CYL:${cyl}`);
        if (axis && cyl && parseFloat(cyl) !== 0) data.push(`AXIS:${axis}`);
        if (visus) data.push(`NC:${visus}`);
        if (add) data.push(`ADD:${add}`);

        return data.length > 0 ? `${prefix} [${data.join(' ')}]` : null;
    };

    const odStr = getEyeString('OD', 'od-sph', 'od-cyl', 'od-axis', 'od-visus-cc', 'od-add');
    const osStr = getEyeString('OS', 'os-sph', 'os-cyl', 'os-axis', 'os-visus-cc', 'os-add');
    const pd = getValue('pd-input');

    const parts = [];
    if (odStr) parts.push(odStr);
    if (osStr) parts.push(osStr);
    if (pd) parts.push(`PD:${pd}`);

    return parts.join(' | ');
}
console.log(getRefraksiSummaryString());

function parseEyeDetails(text) {
    const data = { sph: '', cyl: '', axis: '', visusCc: '', add: '' };

    const sphMatch = text.match(/SPH:([+-]?[\d.]+)/i);
    const cylMatch = text.match(/CYL:([+-]?[\d.]+)/i);
    const axisMatch = text.match(/AXIS:([\d.]+)/i);
    const visusMatch = text.match(/NC:([\w\/.]+)/i);
    const addMatch = text.match(/ADD:([+-]?[\d.]+)/i);

    if (sphMatch) data.sph = sphMatch[1];
    if (cylMatch) data.cyl = cylMatch[1];
    if (axisMatch) data.axis = axisMatch[1];
    if (visusMatch) data.visusCc = visusMatch[1];
    if (addMatch) data.add = addMatch[1];

    return data;
}

function parseRefraksiString(str) {
    const result = {
        od: { sph: '', cyl: '', axis: '', visusCc: '', add: '' },
        os: { sph: '', cyl: '', axis: '', visusCc: '', add: '' },
        pd: ''
    };

    if (!str || typeof str !== 'string') return result;

    const sections = str.split('|').map(s => s.trim());

    sections.forEach(section => {
        const odMatch = section.match(/^OD\s*\[(.*?)\]$/i);
        const osMatch = section.match(/^OS\s*\[(.*?)\]$/i);
        const pdMatch = section.match(/^PD:([\d.]+)/i);

        if (odMatch) {
            result.od = parseEyeDetails(odMatch[1]);
        } else if (osMatch) {
            result.os = parseEyeDetails(osMatch[1]);
        } else if (pdMatch) {
            result.pd = pdMatch[1];
        }
    });

    return result;
}

function populateRefraksiForm(refraksiString) {
    const parsedData = parseRefraksiString(refraksiString);

    const fieldMap = {
        'od-sph': parsedData.od.sph,
        'od-cyl': parsedData.od.cyl,
        'od-axis': parsedData.od.axis,
        'od-visus-cc': parsedData.od.visusCc,
        'od-add': parsedData.od.add,

        'os-sph': parsedData.os.sph,
        'os-cyl': parsedData.os.cyl,
        'os-axis': parsedData.os.axis,
        'os-visus-cc': parsedData.os.visusCc,
        'os-add': parsedData.os.add,

        'pd-input': parsedData.pd
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

    const formatEyeData = (prefix, sphId, cylId, axisId, visusId, addId) => {
        const sph = getValue(sphId);
        const cyl = getValue(cylId);
        const axis = getValue(axisId);
        const visus = getValue(visusId);
        const add = getValue(addId);

        // Jika tidak ada data sama sekali untuk mata ini
        if (!sph && !cyl && !visus && !add) return null;

        const parts = [];
        if (sph) parts.push(`SPH ${sph}`);
        if (cyl) {
            parts.push(`CYL ${cyl}`);
            if (axis) parts.push(`x ${axis}°`);
        }
        if (visus) parts.push(`CC ${visus}`); // Menggunakan CC (cum correctione)
        if (add) parts.push(`ADD ${add}`);

        return `${prefix}: ${parts.join(' ')}`;
    };

    const odString = formatEyeData('OD', 'od-sph', 'od-cyl', 'od-axis', 'od-visus-cc', 'od-add');
    const osString = formatEyeData('OS', 'os-sph', 'os-cyl', 'os-axis', 'os-visus-cc', 'os-add');
    const pd = getValue('pd-input');

    const result = [];
    if (odString) result.push(odString);
    if (osString) result.push(osString);
    if (pd) result.push(`PD ${pd}mm`);

    return result.join(' | ');
}


document.getElementById('save-button').addEventListener('click', async () => {
    const summaryString = getRefraksiSummaryString();
    const standardString = getRefraksiStandardString();
    const parsedData = populateRefraksiForm(summaryString);

    console.log('Output String Refraksi:', summaryString);
    console.log('Parsed JSON Object:', parsedData);
    console.log(standardString);
    let tgl_perawatan = new Date().toISOString().split('T')[0];
    let jam_rawat = new Date().toTimeString().split(' ')[0];
    // alert(`Data Ringkas Refraksi:\n${summaryString}`);
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
    }
    let simpandata = await fetch(API_URL + '/api/ralan/pemeriksaan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(data)
    })
    simpandata = await simpandata.json();
    console.log(simpandata);
    if (simpandata.status === true) {
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
    } else {
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
            icon: 'error',
            title: 'Data Gagal Disimpan'
        })
    }
});