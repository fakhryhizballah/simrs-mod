// PWA Install Popup Handler
const installPopup = document.getElementById('install-popup');
const closePopupBtn = document.getElementById('close-popup');
const dismissBtn = document.getElementById('dismiss-btn');
const installBtn = document.getElementById('install-btn');
let deferredPrompt;

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPopup();
});

function showInstallPopup() {
    installPopup.style.visibility = 'visible';
    installPopup.classList.remove('scale-95', 'opacity-0', 'pointer-events-none');
    installPopup.classList.add('scale-100', 'opacity-100');
}

function hideInstallPopup() {
    installPopup.classList.add('scale-95', 'opacity-0', 'pointer-events-none');
    installPopup.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        installPopup.style.visibility = 'hidden';
    }, 300);
}

closePopupBtn.addEventListener('click', hideInstallPopup);
dismissBtn.addEventListener('click', hideInstallPopup);

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('PWA installed');
        }
        deferredPrompt = null;
        hideInstallPopup();
    }
});