import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="landing-container">
      <div class="hero-section">
        <div class="brand-large">
             <div class="icon-large">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" />
                </svg>
             </div>
             <h1>AI Notepad Assistant</h1>
             <p>Turn chaos into clarity with AI-powered task management.</p>
        </div>
      </div>

      <div class="auth-section">
        <div class="auth-card">
            <!-- Toggle between Login and Register views could be here, but simpler to just show Login form -->
            <h2>Welcome Back</h2>
            <p class="subtitle">Sign in to sync across devices</p>

            <form (ngSubmit)="onLogin()">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" [(ngModel)]="loginForm.username" name="username" placeholder="Required for Cloud Sync" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" [(ngModel)]="loginForm.password" name="password" placeholder="••••••••" required>
                </div>
                
                <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>

                <button type="submit" class="btn-primary" [disabled]="loading">
                    {{ loading ? 'Signing In...' : 'Sign In' }}
                </button>
            </form>

            <div class="divider">
                <span>OR</span>
            </div>

            <button class="btn-secondary" (click)="continueAsGuest()">
                Continue as Guest
            </button>

            <p class="footer-link">
                New here? <a routerLink="/register">Create an account</a>
            </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .landing-container {
        display: flex;
        min-height: 100vh;
        background: var(--color-bg-secondary);
        position: relative;
        overflow: hidden;
    }
    
    .landing-container::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
        animation: float 15s ease-in-out infinite;
    }
    
    .landing-container::after {
        content: '';
        position: absolute;
        bottom: -50%;
        left: -50%;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
        animation: float 20s ease-in-out infinite reverse;
    }
    
    .hero-section {
        flex: 1;
        background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        padding: 2rem;
        position: relative;
        overflow: hidden;
    }
    
    .hero-section::before {
        content: '';
        position: absolute;
        inset: 0;
        background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="2" fill="white" opacity="0.1"/></svg>');
        animation: float 30s linear infinite;
    }
    
    .brand-large {
        text-align: center;
        position: relative;
        z-index: 1;
    }
    
    .icon-large {
        width: 100px;
        height: 100px;
        background: rgba(255,255,255,0.2);
        backdrop-filter: blur(10px);
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 2rem;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        animation: float 3s ease-in-out infinite;
    }
    
    h1 { 
        font-size: 3rem; 
        margin: 0 0 1rem; 
        font-weight: 800; 
        letter-spacing: -0.02em;
        text-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    p { 
        font-size: 1.25rem; 
        opacity: 0.95; 
        max-width: 450px; 
        margin: 0 auto; 
        line-height: 1.6;
    }

    .auth-section {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        position: relative;
        z-index: 1;
    }
    
    .auth-card {
        width: 100%;
        max-width: 440px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        padding: 3rem;
        border-radius: 24px;
        box-shadow: var(--shadow-xl);
        border: 1px solid var(--glass-border);
        animation: fadeIn 0.5s ease-out;
    }
    
    h2 { 
        margin: 0; 
        font-size: 1.75rem; 
        color: var(--color-text-primary); 
        font-weight: 800;
    }
    
    .subtitle { 
        color: var(--color-text-secondary); 
        margin: 0.5rem 0 2rem; 
        font-size: 0.95rem;
    }
    
    .form-group { 
        margin-bottom: 1.5rem; 
    }
    
    label { 
        display: block; 
        margin-bottom: 0.5rem; 
        font-size: 0.875rem; 
        font-weight: 600; 
        color: var(--color-text-primary); 
    }
    
    input { 
        width: 100%; 
        padding: 0.875rem 1rem; 
        border: 2px solid var(--color-border); 
        border-radius: 12px; 
        font-size: 1rem;
        transition: all var(--transition-base);
        background: var(--color-bg-primary);
        color: var(--color-text-primary);
    }
    
    input:focus { 
        outline: none; 
        border-color: var(--color-primary); 
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        transform: translateY(-2px);
    }

    .btn-primary {
        width: 100%; 
        padding: 1rem; 
        background: var(--gradient-primary); 
        color: white; 
        border: none; 
        border-radius: 12px;
        font-weight: 600; 
        cursor: pointer; 
        font-size: 1rem; 
        margin-top: 0.5rem;
        box-shadow: var(--shadow-md);
        transition: all var(--transition-base);
    }
    
    .btn-primary:hover { 
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
    }
    
    .btn-primary:disabled { 
        opacity: 0.7; 
        cursor: not-allowed;
        transform: none;
    }

    .divider { 
        margin: 2rem 0; 
        text-align: center; 
        position: relative; 
    }
    
    .divider::before {
        content: ''; 
        position: absolute; 
        left: 0; 
        top: 50%; 
        width: 100%; 
        height: 1px; 
        background: var(--color-border);
    }
    
    .divider span { 
        position: relative; 
        background: var(--glass-bg); 
        padding: 0 1rem; 
        color: var(--color-text-tertiary); 
        font-size: 0.875rem; 
        font-weight: 600;
    }

    .btn-secondary {
        width: 100%; 
        padding: 1rem; 
        background: var(--color-bg-tertiary); 
        color: var(--color-text-primary); 
        border: 2px solid var(--color-border); 
        border-radius: 12px;
        font-weight: 600; 
        cursor: pointer; 
        font-size: 1rem;
        transition: all var(--transition-base);
    }
    
    .btn-secondary:hover { 
        background: var(--color-bg-primary); 
        border-color: var(--color-primary);
        color: var(--color-primary);
        transform: translateY(-2px);
    }

    .footer-link { 
        margin-top: 2rem; 
        text-align: center; 
        font-size: 0.875rem; 
        color: var(--color-text-secondary); 
    }
    
    a { 
        color: var(--color-primary); 
        text-decoration: none; 
        font-weight: 600;
        transition: color var(--transition-fast);
    }
    
    a:hover {
        color: var(--color-primary-dark);
        text-decoration: underline;
    }
    
    .error-message { 
        color: var(--color-error); 
        font-size: 0.875rem; 
        margin-bottom: 1rem; 
        background: rgba(239, 68, 68, 0.1); 
        padding: 0.75rem; 
        border-radius: 8px; 
        text-align: center;
        border-left: 3px solid var(--color-error);
    }

    @media (max-width: 768px) {
        .landing-container { flex-direction: column; }
        .hero-section { padding: 3rem 1.5rem; min-height: 40vh; }
        .auth-section { padding: 1.5rem; }
        .auth-card { padding: 2rem; }
        h1 { font-size: 2rem; }
        p { font-size: 1rem; }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
    }
  `]
})
export class LandingComponent {
  loginForm = { username: '', password: '' };
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {
    // If already logged in, redirect to app
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/app']);
    }
  }

  onLogin() {
    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.loginForm).subscribe({
      next: () => {
        this.router.navigate(['/app']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = "Invalid credentials";
      }
    });
  }

  continueAsGuest() {
    this.router.navigate(['/app']);
  }
}
