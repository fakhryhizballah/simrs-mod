import { getCookieValue } from "./cookie.js";
const decoded = getCookieValue('decoded') || 'User';
const username = JSON.parse(decoded).fullname;

document.getElementById('username').textContent = username;
