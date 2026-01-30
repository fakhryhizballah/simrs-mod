function getCookieValue(name) {
    let value = document.cookie.split(';').filter(item => item.trim().startsWith(name + '='))[0];
    if (value) {
        value = decodeURIComponent(value.split('=')[1]);
    } else {
        value = null;
    }
    return value;
}
export { getCookieValue };