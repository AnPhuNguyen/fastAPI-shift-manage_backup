function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
};

document.addEventListener('DOMContentLoaded', () => {
    // Redirect to success page if already logged in
    if (localStorage.getItem('access_token')) {
        // window.location.href = '/static/success.html';
        const decoded = parseJwt(localStorage.getItem('access_token'));
        const accessRight = decoded.access_right;
        if (accessRight === 'staff') {
            window.location.href = '/staff';
        } else if (accessRight === 'admin') {
            window.location.href = '/admin';
        } else {
            window.location.href = '/';
            errorElem.textContent = 'Vai trò không xác định nên đã thoát ra ngoài. Vui lòng đăng nhập lại';
        }
    }

    //handling login form submit
    const form = document.getElementById('loginForm');
    const errorElem = document.getElementById('error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorElem.textContent = '';

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_name: username, password: password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                errorElem.textContent = errorData.detail || 'Đăng nhập thất bại';
                return;
            }

            const data = await response.json();
            localStorage.setItem('access_token', data.access_token);
            // Decode JWT token to get access_right

            const decoded = parseJwt(data.access_token);
            const accessRight = decoded.access_right;
            if (accessRight === 'staff') {
                window.location.href = '/staff';
            } else if (accessRight === 'admin') {
                window.location.href = '/admin';
            } else {
                // default fallback
                // window.location.href = '/';
                errorElem.textContent = 'Vai trò không xác định nên đã thoát ra ngoài. Vui lòng đăng nhập lại';
            }
        } catch (error) {
            errorElem.textContent = 'Error connecting to server';
        }
    });
});
