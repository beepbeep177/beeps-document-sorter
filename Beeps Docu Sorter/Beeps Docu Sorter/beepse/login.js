// Login System Logic 💖

class LoginSystem {
    constructor() {
        this.currentRole = 'client';
        this.currentMode = 'login';
        this.users = this.loadUsers();
        
        this.initializeEventListeners();
    }
    
    loadUsers() {
        const defaultUsers = {
            'client@demo.com': { password: 'demo123', role: 'client', name: 'Demo Client' },
            'admin@demo.com': { password: 'admin123', role: 'admin', name: 'Admin User' },
            'john@client.com': { password: 'client123', role: 'client', name: 'John Smith' },
            'bea@admin.com': { password: 'admin123', role: 'admin', name: 'Bea Admin' }
        };
        
        const savedUsers = localStorage.getItem('registeredUsers');
        if (savedUsers) {
            return { ...defaultUsers, ...JSON.parse(savedUsers) };
        }
        return defaultUsers;
    }
    
    saveUsers() {
        const defaultEmails = ['client@demo.com', 'admin@demo.com', 'john@client.com', 'bea@admin.com'];
        const customUsers = {};
        
        Object.keys(this.users).forEach(email => {
            if (!defaultEmails.includes(email)) {
                customUsers[email] = this.users[email];
            }
        });
        
        localStorage.setItem('registeredUsers', JSON.stringify(customUsers));
    }
    
    initializeEventListeners() {
        // Role selector buttons
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchRole(e.target.dataset.role);
            });
        });
        
        // Auth form
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.currentMode === 'login') {
                this.handleLogin();
            } else {
                this.handleSignup();
            }
        });
        
        // Auth mode toggle
        document.querySelectorAll('.auth-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchAuthMode(e.target.dataset.mode);
            });
        });
        
        // Demo account buttons
        document.querySelectorAll('.demo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.fillDemoCredentials(e.target);
            });
        });
    }
    
    switchRole(role) {
        this.currentRole = role;
        
        // Update active button
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.role === role);
        });
        
        // Update auth button text
        this.updateAuthButtonText();
    }
    
    fillDemoCredentials(btn) {
        const email = btn.dataset.email;
        const password = btn.dataset.password;
        const role = btn.dataset.role;
        
        document.getElementById('email').value = email;
        document.getElementById('password').value = password;
        
        this.switchRole(role);
    }
    
    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Show loading state
        this.setLoadingState(true);
        
        // Simulate API call delay
        await this.delay(1000);
        
        // Validate credentials
        const user = this.validateCredentials(email, password);
        
        if (user && user.role === this.currentRole) {
            // Store user session
            this.setUserSession(user, email);
            
            // Redirect based on role
            if (user.role === 'client') {
                window.location.href = 'client-portal.html';
            } else {
                window.location.href = 'admin-dashboard.html';
            }
        } else {
            this.showError('Invalid credentials or wrong role selected');
            this.setLoadingState(false);
        }
    }
    
    validateCredentials(email, password) {
        const user = this.users[email];
        if (user && user.password === password) {
            return user;
        }
        return null;
    }
    
    setUserSession(user, email) {
        const session = {
            email: email,
            name: user.name,
            role: user.role,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('userSession', JSON.stringify(session));
    }
    
    setLoadingState(loading) {
        const loginBtn = document.querySelector('.login-btn');
        const authText = document.getElementById('authText');
        const spinner = document.querySelector('.spinner');
        
        if (loading) {
            loginBtn.disabled = true;
            authText.style.display = 'none';
            spinner.style.display = 'inline-block';
        } else {
            loginBtn.disabled = false;
            authText.style.display = 'inline';
            spinner.style.display = 'none';
        }
    }
    
    showError(message) {
        // Create error message if it doesn't exist
        let errorDiv = document.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                background: rgba(231, 76, 60, 0.1);
                border: 1px solid #e74c3c;
                color: #e74c3c;
                padding: 12px 15px;
                border-radius: 10px;
                margin-top: 15px;
                text-align: center;
                font-size: 0.9rem;
                animation: shake 0.5s ease;
            `;
            document.querySelector('.login-form').appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Hide error after 3 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
    
    switchAuthMode(mode) {
        this.currentMode = mode;
        
        // Update active button
        document.querySelectorAll('.auth-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Show/hide form fields
        const nameGroup = document.getElementById('nameGroup');
        const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
        const fullNameInput = document.getElementById('fullName');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        if (mode === 'signup') {
            nameGroup.style.display = 'block';
            confirmPasswordGroup.style.display = 'block';
            fullNameInput.required = true;
            confirmPasswordInput.required = true;
        } else {
            nameGroup.style.display = 'none';
            confirmPasswordGroup.style.display = 'none';
            fullNameInput.required = false;
            confirmPasswordInput.required = false;
        }
        
        this.updateAuthButtonText();
    }
    
    updateAuthButtonText() {
        const authText = document.getElementById('authText');
        if (this.currentMode === 'login') {
            const text = this.currentRole === 'client' ? 'Login as Client' : 'Login as Admin';
            authText.textContent = text;
        } else {
            const text = this.currentRole === 'client' ? 'Create Client Account' : 'Create Admin Account';
            authText.textContent = text;
        }
    }
    
    async handleSignup() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const fullName = document.getElementById('fullName').value;
        
        // Validate inputs
        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }
        
        if (this.users[email]) {
            this.showError('Account with this email already exists');
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        // Simulate API call delay
        await this.delay(1500);
        
        // Create new user
        this.users[email] = {
            password: password,
            role: this.currentRole,
            name: fullName
        };
        
        // Save to localStorage
        this.saveUsers();
        
        // Auto-login the new user
        this.setUserSession(this.users[email], email);
        
        // Redirect based on role
        if (this.currentRole === 'client') {
            window.location.href = 'client-portal.html';
        } else {
            window.location.href = 'admin-dashboard.html';
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize login system
document.addEventListener('DOMContentLoaded', () => {
    new LoginSystem();
    
    // Add sparkle effects
    setInterval(() => {
        createSparkle();
    }, 3000);
});

function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.innerHTML = '✨';
    sparkle.style.position = 'fixed';
    sparkle.style.left = Math.random() * window.innerWidth + 'px';
    sparkle.style.top = Math.random() * window.innerHeight + 'px';
    sparkle.style.fontSize = '20px';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '1000';
    sparkle.style.animation = 'sparkleFloat 4s ease-out forwards';
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 4000);
}

// Add sparkle animation
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkleFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
        }
        100% {
            opacity: 0;
            transform: translateY(-150px) scale(0.3) rotate(180deg);
        }
    }
`;
document.head.appendChild(sparkleStyle);