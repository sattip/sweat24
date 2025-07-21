// Debug script για authentication
console.log('=== SWEAT24 AUTH DEBUG ===');
console.log('auth_token:', localStorage.getItem('auth_token'));
console.log('sweat24_user:', localStorage.getItem('sweat24_user'));
console.log('user:', localStorage.getItem('user'));

// Test login endpoint
fetch('https://sweat93laravel.obs.com.gr/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@sweat24.gr',
    password: 'password123'
  })
})
.then(response => {
  console.log('Login response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Login response data:', data);
  if (data.token) {
    console.log('✅ Token received:', data.token);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('sweat24_user', JSON.stringify(data.user));
  }
})
.catch(error => {
  console.error('Login error:', error);
}); 