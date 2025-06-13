import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-anonymization-request-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="dialog-overlay" (click)="onCancel()">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <h2>Request Data Anonymization</h2>
        <p class="info-text">Please provide details for your anonymization request. This request will be processed within 30 days as required by GDPR.</p>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="reason">Reason for Anonymization*</label>
            <textarea 
              id="reason" 
              formControlName="reason" 
              rows="3" 
              placeholder="Please explain why you want your data to be anonymized"
              [class.error]="form.get('reason')?.invalid && form.get('reason')?.touched">
            </textarea>
            <div class="error-message" *ngIf="form.get('reason')?.invalid && form.get('reason')?.touched">
              Reason is required
            </div>
          </div>

          <div class="form-group">
            <label for="notes">Additional Notes (Optional)</label>
            <textarea 
              id="notes" 
              formControlName="notes" 
              rows="3" 
              placeholder="Any additional information you'd like to provide">
            </textarea>
          </div>

          <div class="form-group checkbox">
            <input type="checkbox" id="confirm" formControlName="confirm">
            <label for="confirm">I understand that this action cannot be undone and my data will be permanently anonymized</label>
            <div class="error-message" *ngIf="form.get('confirm')?.invalid && form.get('confirm')?.touched">
              You must confirm this action
            </div>
          </div>

          <div class="dialog-actions">
            <button type="button" class="cancel-button" (click)="onCancel()">Cancel</button>
            <button type="submit" class="submit-button" [disabled]="form.invalid">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .dialog-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    h2 {
      color: #333;
      margin-bottom: 1rem;
      text-align: center;
    }

    .info-text {
      color: #666;
      margin-bottom: 1.5rem;
      text-align: center;
      font-size: 0.9rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
    }

    textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      resize: vertical;
    }

    textarea.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .checkbox {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .checkbox input[type="checkbox"] {
      margin-top: 0.25rem;
    }

    .checkbox label {
      font-size: 0.9rem;
      color: #666;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .cancel-button,
    .submit-button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s ease;
    }

    .cancel-button {
      background-color: #6c757d;
      color: white;
    }

    .cancel-button:hover {
      background-color: #5a6268;
    }

    .submit-button {
      background-color: #e67e22;
      color: white;
    }

    .submit-button:hover:not(:disabled) {
      background-color: #d35400;
    }

    .submit-button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class AnonymizationRequestDialogComponent {
  @Output() submit = new EventEmitter<{reason: string, notes?: string}>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10)]],
      notes: [''],
      confirm: [false, Validators.requiredTrue]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.submit.emit({
        reason: this.form.get('reason')?.value,
        notes: this.form.get('notes')?.value || ''
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
} 