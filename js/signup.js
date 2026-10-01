document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  const signupBtn = document.getElementById('signupBtn');

  if (!form || !signupBtn) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      password: document.getElementById('password').value,
    };

    if (!payload.name || !payload.email || !payload.phone || !payload.password) {
      alert('Please fill in all fields');
      return;
    }

    signupBtn.disabled = true;
    signupBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account...';

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Signup failed');
      }

      localStorage.setItem('securepayToken', result.token);
      localStorage.setItem('securepayUser', JSON.stringify(result.user));
      alert('Account created successfully. Redirecting to dashboard...');
      window.location.href = 'dashboard.html';
    } catch (error) {
      alert(error.message || 'Unable to create account.');
      signupBtn.disabled = false;
      signupBtn.innerHTML = '<i class="fa-solid fa-user-check"></i> Create Account';
    }
  });
});
