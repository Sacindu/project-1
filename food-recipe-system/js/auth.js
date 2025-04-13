// User authentication functions

// Add event listeners once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      loginUser(email, password);
    });
  }
  
  // Initialize register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      registerUser(username, email, password, confirmPassword);
    });
  }
  
  // Initialize logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
  }
});

function loginUser(email, password) {
  // Validate inputs
  if (!validateEmail(email) || !password) {
    showError('Please enter a valid email and password');
    return;
  }
  
  // For this implementation, we'll use localStorage to simulate authentication
  // In a real application, this would be an API call to your backend
  
  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Check if user exists and password matches
  const user = users.find(u => u.email === email);
  
  if (!user) {
    showError('No account found with this email. Please register.');
    return;
  }
  
  if (user.password !== password) {
    showError('Incorrect password. Please try again.');
    return;
  }
  
  // Successful login
  const currentUser = {
    id: user.id,
    name: user.username,
    email: user.email
  };
  
  // Store in localStorage
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  // Redirect to home page
  window.location.href = 'index.html';
}

function registerUser(username, email, password, confirmPassword) {
  // Validate inputs
  if (!username || !validateEmail(email) || !password) {
    showError('Please fill in all fields with valid information');
    return;
  }
  
  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }
  
  if (password.length < 6) {
    showError('Password must be at least 6 characters long');
    return;
  }
  
  // Get existing users
  const users = JSON.parse(localStorage.getItem('users')) || [];
  
  // Check if email already exists
  if (users.some(user => user.email === email)) {
    showError('This email is already registered. Please login instead.');
    return;
  }
  
  // Create new user
  const newUser = {
    id: Date.now(),
    username: username,
    email: email,
    password: password,  // In a real app, this would be hashed
    created_at: new Date().toISOString()
  };
  
  // Add to users array
  users.push(newUser);
  
  // Save to localStorage
  localStorage.setItem('users', JSON.stringify(users));
  
  // Create current user session
  const currentUser = {
    id: newUser.id,
    name: newUser.username,
    email: newUser.email
  };
  
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  // Redirect to home page
  window.location.href = 'index.html';
}

function logoutUser() {
  // Clear user from localStorage
  localStorage.removeItem('currentUser');
  
  // Redirect to login page
  window.location.href = 'login.html';
}

function checkAuthState() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  
  // Get current page
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';
  
  // Pages that require authentication
  const protectedPages = ['index.html', 'recipe.html', 'categories.html', 'saved-recipes.html', 'profile.html'];
  
  // Pages for non-authenticated users
  const authPages = ['login.html', 'register.html', 'forgot-password.html'];
  
  // Update UI if user is logged in
  if (user) {
    // Update username display
    const usernameElements = document.querySelectorAll('#username');
    usernameElements.forEach(el => {
      el.textContent = user.name || user.email.split('@')[0];
    });
    
    // Redirect if on auth pages
    if (authPages.includes(currentPage)) {
      window.location.href = 'index.html';
      return;
    }
  } else {
    // If not logged in and on protected page, redirect to login
    if (protectedPages.includes(currentPage)) {
      window.location.href = 'login.html';
      return;
    }
  }
}

// Helper functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  } else {
    alert(message);
  }
}