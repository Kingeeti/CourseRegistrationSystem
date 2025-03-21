document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (token) {
    if (userRole === 'student') {
      window.location.href = '/student';
    } else if (userRole === 'admin') {
      window.location.href = '/admin';
    }
  }
  
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = `${btn.dataset.tab}-tab`;
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  const studentLoginForm = document.getElementById('student-login-form');
  studentLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const rollNumber = document.getElementById('roll-number').value;
    
    try {
      console.log('Attempting student login with roll number:', rollNumber);
      const response = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rollNumber })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userRollNumber', data.rollNumber);
        
        window.location.href = '/student';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  });
  

  const adminLoginForm = document.getElementById('admin-login-form');
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
      console.log('Attempting admin login with username:', username);
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userName', data.name);
        
        window.location.href = '/admin';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  });
});