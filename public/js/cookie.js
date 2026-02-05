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
export { getCookieValue, claim };