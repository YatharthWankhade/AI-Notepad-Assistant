import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { animate, style, transition, trigger, query, stagger } from '@angular/animations';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts$ | async" 
           class="toast" 
           [ngClass]="toast.type"
           @toastAnimation
           (click)="remove(toast.id)">
        <div class="toast-icon">
            <span *ngIf="toast.type === 'success'">✓</span>
            <span *ngIf="toast.type === 'error'">✕</span>
            <span *ngIf="toast.type === 'info'">ℹ</span>
        </div>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none; /* Allow clicking through container */
    }

    .toast {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      padding: 12px 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      min-width: 280px;
      max-width: 400px;
      pointer-events: auto; /* Re-enable clicks on toasts */
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .toast.success {
      background: rgba(16, 185, 129, 0.9);
      color: white;
      border-color: rgba(16, 185, 129, 0.2);
    }

    .toast.error {
      background: rgba(239, 68, 68, 0.9);
      color: white;
      border-color: rgba(239, 68, 68, 0.2);
    }

    .toast.info {
      background: rgba(59, 130, 246, 0.9);
      color: white;
      border-color: rgba(59, 130, 246, 0.2);
    }

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .toast-message {
      font-size: 0.95rem;
      font-weight: 500;
    }
  `],
    animations: [
        trigger('toastAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('300ms cubic-bezier(0.2, 0.8, 0.2, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ])
    ]
})
export class ToastComponent {
    constructor(public toastService: ToastService) { }

    remove(id: string) {
        this.toastService.remove(id);
    }
}
