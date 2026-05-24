// Login Form Handler
document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Login',
                text: data.message
            });
        } else {
            location.href = '/menu';
        }
    } catch (error) {
        console.log(error);
        alert('Terjadi kesalahan saat login');
    }
});