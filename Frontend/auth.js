// ================== AUTOCARE360 AUTHENTICATION SYSTEM ==================

// === GLOBAL VARIABLES ===
let isSubmitting = false;

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
    initializeParticles();
    initializeFormValidation();
    setupFormHandlers();
    
    // Check if user is already logged in
    checkExistingAuth();
});

// === PARTICLE BACKGROUND ===
function initializeParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 40, density: { enable: true, value_area: 800 } },
                color: { value: "#00d4ff" },
                shape: { type: "circle" },
                opacity: { value: 0.3, random: true },
                size: { value: 2, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#00d4ff",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    repulse: { distance: 100, duration: 0.4 },
                    push: { particles_nb: 2 }
                }
            },
            retina_detect: true
        });
    }
}

// === FORM VALIDATION AND SETUP ===
function initializeFormValidation() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
        
        // Format email to lowercase
        if (input.type === 'email') {
            input.addEventListener('input', function() {
                this.value = this.value.toLowerCase();
            });
        }
    });
}

function setupFormHandlers() {
    const loginForm = document.getElementById('loginFormContent');
    const forgotForm = document.getElementById('forgotFormContent');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
}

// === AUTHENTICATION FUNCTIONS ===
async function handleLogin(event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate inputs
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    isSubmitting = true;
    showLoading('Authenticating...');
    setButtonLoading(document.querySelector('.auth-btn'), true);
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        console.log("✅ Login response:", result);
        
        if (!response.ok) {
            throw new Error(result.error || "Login failed");
        }
        
        // Store authentication data
        const authData = {
            token: result.token,
            user: result.user,
            loginTime: Date.now(),
            rememberMe: rememberMe
        };
        
        if (rememberMe) {
            localStorage.setItem('autocare360_auth', JSON.stringify(authData));
        } else {
            sessionStorage.setItem('autocare360_auth', JSON.stringify(authData));
        }
        
        // Show success and redirect
        showSuccessModal(result.user);
        
    } catch (error) {
        console.error('❌ Login failed:', error.message);
        showError(error.message || 'Login failed. Please try again.');
    } finally {
        hideLoading();
        setButtonLoading(document.querySelector('.auth-btn'), false);
        isSubmitting = false;
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    
    if (!email) {
        showError('Please enter your email address');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    showLoading('Sending reset instructions...');
    
    // Simulate API call (implement actual forgot password logic)
    setTimeout(() => {
        hideLoading();
        showSuccess('Reset instructions have been sent to your email');
        switchForm('login');
    }, 2000);
}

function checkExistingAuth() {
    const authData = localStorage.getItem('autocare360_auth') || 
                    sessionStorage.getItem('autocare360_auth');
    
    if (authData) {
        try {
            const parsed = JSON.parse(authData);
            // Check if token is still valid (basic check)
            if (parsed.token && parsed.loginTime && (Date.now() - parsed.loginTime < 24 * 60 * 60 * 1000)) {
                // Redirect to dashboard if already logged in
                window.location.href = '/dashboard';
                return;
            }
        } catch (err) {
            // Clear invalid auth data
            localStorage.removeItem('autocare360_auth');
            sessionStorage.removeItem('autocare360_auth');
        }
    }
}

// === UTILITY FUNCTIONS ===
function switchForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const forgotForm = document.getElementById('forgotForm');
    
    if (formType === 'login') {
        loginForm.classList.add('active');
        forgotForm.classList.remove('active');
    } else if (formType === 'forgot') {
        loginForm.classList.remove('active');
        forgotForm.classList.add('active');
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentElement.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        toggle.className = 'fas fa-eye';
    }
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    clearFieldError(event);
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    if (field.type === 'password' && value && value.length < 6) {
        showFieldError(field, 'Password must be at least 6 characters');
        return false;
    }
    
    showFieldSuccess(field);
    return true;
}

function clearFieldError(event) {
    const field = event.target;
    const wrapper = field.closest('.input-wrapper');
    if (!wrapper) return;
    
    wrapper.classList.remove('error', 'success');
    const errorMsg = wrapper.querySelector('.error-message');
    if (errorMsg) errorMsg.remove();
}

function showFieldError(field, message) {
    const wrapper = field.closest('.input-wrapper');
    if (!wrapper) return;
    
    wrapper.classList.add('error');
    wrapper.classList.remove('success');
    
    const existingError = wrapper.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    wrapper.appendChild(errorElement);
}

function showFieldSuccess(field) {
    const wrapper = field.closest('.input-wrapper');
    if (!wrapper) return;
    
    wrapper.classList.add('success');
    wrapper.classList.remove('error');
}

function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
}

// === UI HELPERS ===
function showLoading(message = 'Processing...') {
    const overlay = document.getElementById('loadingOverlay');
    const messageEl = document.getElementById('loadingMessage');
    if (messageEl) messageEl.textContent = message;
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function setButtonLoading(button, loading) {
    if (!button) return;
    
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function showError(message) {
    showModal('errorModal', {
        title: 'Authentication Error',
        message: message
    });
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-notification';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00ff88;
        color: #000;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 255, 136, 0.3);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 300px;
    `;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

function showSuccessModal(user) {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Start countdown
        let countdown = 3;
        const countdownEl = document.getElementById('countdown');
        
        const timer = setInterval(() => {
            countdown--;
            if (countdownEl) countdownEl.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(timer);
                redirectToDashboard();
            }
        }, 1000);
    }
}

function showModal(modalId, options = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    if (options.title) {
        const titleEl = modal.querySelector('h3');
        if (titleEl) titleEl.textContent = options.title;
    }
    
    if (options.message) {
        const messageEl = modal.querySelector('#errorMessage') || modal.querySelector('p');
        if (messageEl) messageEl.textContent = options.message;
    }
    
    modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function redirectToDashboard() {
    window.location.href = '/dashboard';
}

// === KEYBOARD NAVIGATION ===
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.tagName !== 'BUTTON') {
        const activeForm = document.querySelector('.auth-form.active form');
        if (activeForm) {
            event.preventDefault();
            const submitBtn = activeForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.click();
        }
    }
    
    if (event.key === 'Escape') {
        // Close any open modals
        const openModal = document.querySelector('.modal-overlay[style*="flex"]');
        if (openModal) {
            openModal.style.display = 'none';
        }
    }
});
