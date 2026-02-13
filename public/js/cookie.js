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
export { getCookieValue, claim, ConvertlogicVersion };