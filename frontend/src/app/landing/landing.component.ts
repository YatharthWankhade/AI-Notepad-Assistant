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
        background: #F9FAFB;
    }
    .hero-section {
        flex: 1;
        background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        padding: 2rem;
    }
    .brand-large {
        text-align: center;
    }
    .icon-large {
        width: 80px;
        height: 80px;
        background: rgba(255,255,255,0.2);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
    }
    h1 { font-size: 2.5rem; margin: 0 0 1rem; font-weight: 800; }
    p { font-size: 1.25rem; opacity: 0.9; max-width: 400px; margin: 0 auto; line-height: 1.5; }

    .auth-section {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    }
    .auth-card {
        width: 100%;
        max-width: 400px;
        background: white;
        padding: 2.5rem;
        border-radius: 24px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
    }
    h2 { margin: 0; font-size: 1.5rem; color: #111827; }
    .subtitle { color: #6B7280; margin: 0.5rem 0 2rem; }
    
    .form-group { margin-bottom: 1.25rem; }
    label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
    input { 
        width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 12px; font-size: 1rem;
        transition: border-color 0.2s;
    }
    input:focus { outline: none; border-color: #6366F1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }

    .btn-primary {
        width: 100%; padding: 0.875rem; background: #6366F1; color: white; border: none; border-radius: 12px;
        font-weight: 600; cursor: pointer; font-size: 1rem; margin-top: 0.5rem;
    }
    .btn-primary:hover { background: #4F46E5; }
    .btn-primary:disabled { opacity: 0.7; }

    .divider { margin: 1.5rem 0; text-align: center; position: relative; }
    .divider::before {
        content: ''; position: absolute; left: 0; top: 50%; width: 100%; height: 1px; background: #E5E7EB;
    }
    .divider span { position: relative; background: white; padding: 0 1rem; color: #9CA3AF; font-size: 0.875rem; }

    .btn-secondary {
        width: 100%; padding: 0.875rem; background: #F3F4F6; color: #4B5563; border: none; border-radius: 12px;
        font-weight: 600; cursor: pointer; font-size: 1rem;
    }
    .btn-secondary:hover { background: #E5E7EB; color: #374151; }

    .footer-link { margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: #6B7280; }
    a { color: #6366F1; text-decoration: none; font-weight: 600; }
    
    .error-message { color: #EF4444; font-size: 0.875rem; margin-bottom: 1rem; background: #FEF2F2; padding: 0.5rem; border-radius: 8px; text-align: center; }

    @media (max-width: 768px) {
        .landing-container { flex-direction: column; }
        .hero-section { padding: 3rem 1.5rem; text-align: center; }
        .auth-section { padding: 1.5rem; }
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
