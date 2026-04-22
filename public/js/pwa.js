let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPopup();
});

function showInstallPopup() {
    const popup = document.getElementById('install-popup');
    popup.classList.remove('hidden');
}

document.getElementById('install-btn').addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
            hideInstallPopup();
        });
    }
});

document.getElementById('dismiss-btn').addEventListener('click', () => {
    hideInstallPopup();
});

document.getElementById('close-popup').addEventListener('click', () => {
    hideInstallPopup();
});

function hideInstallPopup() {
    const popup = document.getElementById('install-popup');
    popup.classList.add('hidden');
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/asset/js/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}