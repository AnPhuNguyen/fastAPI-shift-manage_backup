document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    const errorElem = document.getElementById('error');
    const successElem = document.getElementById('success');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorElem.textContent = '';
        successElem.textContent = '';

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_name: username, password: password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                errorElem.textContent = errorData.detail || 'Signup failed';
                return;
            }

            successElem.textContent = 'Signup successful! You can now login.';
            form.reset();
        } catch (error) {
            errorElem.textContent = 'Error connecting to server';
        }
    });
});
