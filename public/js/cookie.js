function getCookieValue(name) {
    let value = document.cookie.split(';').filter(item => item.trim().startsWith(name + '='))[0];
    if (value) {
        value = decodeURIComponent(value.split('=')[1]);
    } else {
        value = null;
    }
    return value;
}
async function claim(databody) {
    let token = getCookieValue('token');
    let API_URL = getCookieValue('API_URL');
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
function ConvertlogicVersion(logicVersion) {

    // 1. Ekstrak bagian timestamp (12 digit terakhir) menggunakan regex atau substring
    const timestampMatch = logicVersion.match(/\d{12}$/);

    if (timestampMatch) {
        const ts = timestampMatch[0];

        // 2. Pecah string menjadi komponen waktu
        // Format: YYYY MM DD HH mm
        const year = ts.substring(0, 4);
        const monthIndex = ts.substring(4, 6) - 1; // Bulan dalam JS dimulai dari 0 (Januari = 0)
        const day = ts.substring(6, 8);
        const hour = ts.substring(8, 10);
        const minute = ts.substring(10, 12);

        const dateObj = new Date(year, monthIndex, day, hour, minute);

        // 4. Daftar singkatan bulan
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
        const shortMonth = monthNames[monthIndex];

        // 5. Format hasil ke string lokal Indonesia
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };

        const formattedDate = dateObj.toLocaleDateString('id-ID', options);

        console.log("Versi Logika Asli:", logicVersion);
        console.log("Hasil Konversi:", formattedDate);

        // Output dengan format bulan JAN FEB MAR...
        console.log(`Format Pendek: ${day} ${shortMonth} ${year} ${hour}:${minute}`);
        return (`${day} ${shortMonth} ${year} ${hour}:${minute}`);

    } else {
        console.error("Format logic_version tidak valid.");
        return null;
    }

}
function losCalculator(tgl_masuk, tgl_pulang) {
    const date1 = new Date(tgl_masuk);
    const date2 = new Date(tgl_pulang);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays
}
function losCalculator2(tgl_masuk, tgl_pulang) {
    // Helper to parse DD/MM/YYYY strings into Date objects
    const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('/').map(Number);
        // Month is 0-indexed in JS (January = 0)
        return new Date(year, month - 1, day);
    };

    const date1 = parseDate(tgl_masuk);
    const date2 = parseDate(tgl_pulang);

    // Check for invalid dates
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        return "Error: Invalid Date Format. Please use DD/MM/YYYY.";
    }

    // Logic: Length of Stay shouldn't be negative
    if (date2 < date1) {
        return "Error: Discharge date cannot be before admission date.";
    }

    const diffTime = date2.getTime() - date1.getTime();

    // Convert milliseconds to days
    // 1000ms * 60s * 60m * 24h
    const msPerDay = 1000 * 60 * 60 * 24;

    // Standard LOS logic: if discharge is the same day, it's often counted as 1 day 
    // or 0 depending on the facility. Here we use Math.max(1, ...) if you want 
    // to ensure at least 1 day, otherwise use Math.floor or Math.round.
    const diffDays = Math.floor(diffTime / msPerDay);
    return diffDays + 1;
}
export { getCookieValue, claim, ConvertlogicVersion, losCalculator, losCalculator2 };