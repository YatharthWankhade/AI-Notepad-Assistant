import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="auth-container">
      <div class="auth-box">
        <h2>Welcome Back</h2>
        <p class="subtitle">Sign in to sync your notes</p>
        
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Username</label>
            <input type="text" [(ngModel)]="form.username" name="username" required placeholder="Enter your username">
          </div>
          
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="form.password" name="password" required placeholder="Enter your password">
          </div>

          <div class="error-msg" *ngIf="errorMessage">{{ errorMessage }}</div>
          
          <button type="submit" [disabled]="loading" class="submit-btn">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="footer-text">
          Don't have an account? <a routerLink="/register">Sign up</a>
        </p>
        <p class="footer-text">
          <a routerLink="/" class="guest-link">Continue as Guest</a>
        </p>
      </div>
    </div>
  `,
    styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #F3F4F6;
    }
    .auth-box {
      background: white;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      width: 100%;
      max-width: 400px;
    }
    h2 {
      margin: 0;
      color: #111827;
      font-size: 1.5rem;
      font-weight: 700;
      text-align: center;
    }
    .subtitle {
      text-align: center;
      color: #6B7280;
      margin-top: 0.5rem;
      margin-bottom: 2rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #374151;
      font-weight: 500;
      font-size: 0.875rem;
    }
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #D1D5DB;
      border-radius: 8px;
      margin-top: 0.25rem;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus {
      border-color: #6366F1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    .submit-btn {
      width: 100%;
      padding: 0.75rem;
      background: #6366F1;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .submit-btn:hover {
      background: #4F46E5;
    }
    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .error-msg {
      color: #EF4444;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      text-align: center;
      background: #FEF2F2;
      padding: 0.5rem;
      border-radius: 6px;
    }
    .footer-text {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: #6B7280;
    }
    a {
      color: #6366F1;
      text-decoration: none;
      font-weight: 500;
    }
    a:hover {
      text-decoration: underline;
    }
    .guest-link {
      color: #9CA3AF;
    }
  `]
})
export class LoginComponent {
    form: any = {
        username: '',
        password: ''
    };
    loading = false;
    errorMessage = '';

    constructor(private authService: AuthService, private router: Router) { }

    onSubmit(): void {
        const { username, password } = this.form;
        this.loading = true;
        this.errorMessage = '';

        this.authService.login(this.form).subscribe({
            next: data => {
                this.loading = false;
                // Redirect to home/notepad
                this.router.navigate(['/']);
            },
            error: err => {
                this.loading = false;
                if (err.error && typeof err.error === 'string') {
                    this.errorMessage = err.error;
                } else {
                    this.errorMessage = "Login failed. Please check your credentials.";
                }
            }
        });
    }
}
