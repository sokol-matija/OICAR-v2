import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { UserProfile, ChangePasswordRequest } from '../../core/models/user.model';
import { NgIf, NgClass } from '@angular/common';
import { AnonymizationRequestDialogComponent } from './anonymization-request-dialog.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgIf, NgClass, AnonymizationRequestDialogComponent],
  template: `
    <div class="profile-container">
      <h1>User Profile</h1>

      <div *ngIf="userProfile" class="profile-details">
        <div *ngIf="successMessage" class="message success">
          {{ successMessage }}
        </div>
        <div *ngIf="errorMessage" class="message error">
          {{ errorMessage }}
        </div>
        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
          <div class="profile-row">
            <span class="label">Username:</span>
            <input type="text" formControlName="username" [readonly]="!isEditMode">
          </div>
          <div class="profile-row">
            <span class="label">First Name:</span>
            <input type="text" formControlName="firstName" [readonly]="!isEditMode">
          </div>
          <div class="profile-row">
            <span class="label">Last Name:</span>
            <input type="text" formControlName="lastName" [readonly]="!isEditMode">
          </div>
          <div class="profile-row">
            <span class="label">Email:</span>
            <input type="email" formControlName="email" [readonly]="!isEditMode">
          </div>
          <div class="profile-row" *ngIf="profileForm.get('phoneNumber')?.value !== undefined">
            <span class="label">Phone Number:</span>
            <input type="text" formControlName="phoneNumber" [readonly]="!isEditMode">
          </div>

          <ng-container *ngIf="isEditMode">
            <div class="profile-row">
              <span class="label">Current Password:</span>
              <input type="password" formControlName="currentPassword">
            </div>
            <div class="profile-row">
              <span class="label">New Password:</span>
              <input type="password" formControlName="newPassword">
            </div>
            <div class="profile-row">
              <span class="label">Confirm New Password:</span>
              <input type="password" formControlName="confirmNewPassword">
            </div>
          </ng-container>
          <ng-container *ngIf="!isEditMode">
            <div class="profile-row">
              <span class="label">Password:</span>
              <span class="value">***********</span>
            </div>
          </ng-container>

          <div class="profile-row">
            <span class="label">Member Since:</span>
            <span class="value">{{ userProfile.createdAt | date:'mediumDate' }}</span>
          </div>
          <div class="profile-row">
            <span class="label">Last Updated:</span>
            <span class="value">{{ userProfile.updatedAt | date:'mediumDate' }}</span>
          </div>
          <div class="profile-row" *ngIf="userProfile.lastLoginAt">
            <span class="label">Last Login:</span>
            <span class="value">{{ userProfile.lastLoginAt | date:'mediumDate' }}</span>
          </div>

          <div *ngIf="userProfile.isSeller && userProfile.sellerInfo" class="seller-info">
            <h2>Seller Information</h2>
            <div class="profile-row">
              <span class="label">Business Name:</span>
              <span class="value">{{ userProfile.sellerInfo.businessName }}</span>
            </div>
            <div class="profile-row">
              <span class="label">Business Description:</span>
              <span class="value">{{ userProfile.sellerInfo.businessDescription }}</span>
            </div>
            <div class="profile-row">
              <span class="label">Verified:</span>
              <span class="value">{{ userProfile.sellerInfo.isVerified ? 'Yes' : 'No' }}</span>
            </div>
            <div class="profile-row">
              <span class="label">Verification Status:</span>
              <span class="value">{{ userProfile.sellerInfo.verificationStatus }}</span>
            </div>
          </div>

          <div class="profile-actions">
            <button type="button" 
              *ngIf="!isEditMode" 
              (click)="showAnonymizationDialog()" 
              class="anonymize-button" 
              [disabled]="userProfile?.requestedAnonymization"
              [class.requested]="userProfile?.requestedAnonymization">
              {{ userProfile?.requestedAnonymization ? 'Anonymization Requested' : 'Anonymization Request' }}
            </button>
            <button type="button" *ngIf="!isEditMode" (click)="viewOrderHistory()" class="order-history-button">View Order History</button>
            <button type="button" *ngIf="!isEditMode" (click)="toggleEditMode()">Edit Profile</button>
            <button type="submit" *ngIf="isEditMode" [disabled]="profileForm.invalid">Save Changes</button>
            <button type="button" *ngIf="isEditMode" (click)="cancelEdit()">Cancel</button>
          </div>
        </form>
      </div>

      <div *ngIf="!userProfile && !loadingError" class="loading-message">
        <p>Loading profile...</p>
      </div>

      <div *ngIf="loadingError" class="error-message">
        <p>{{ loadingError }}</p>
      </div>

      <app-anonymization-request-dialog
        *ngIf="showDialog"
        (submit)="onAnonymizationSubmit($event)"
        (cancel)="onAnonymizationCancel()">
      </app-anonymization-request-dialog>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333;
      text-align: center;
      margin-bottom: 2rem;
    }

    .profile-details form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .profile-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
    }

    .profile-row:last-of-type {
      border-bottom: none;
    }

    .label {
      font-weight: bold;
      color: #555;
      flex: 1;
    }

    .value,
    .profile-row input {
      flex: 2;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      color: #333;
    }

    .profile-row input:read-only {
      background-color: #e9ecef;
      cursor: not-allowed;
    }

    .seller-info {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 2px solid #ddd;
    }

    .seller-info h2 {
      color: #333;
      margin-bottom: 1rem;
      text-align: center;
    }

    .profile-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .profile-actions button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s ease;
    }

    .profile-actions button:first-child {
      background-color: #3498db;
      color: white;
    }

    .profile-actions button[type="submit"] {
      background-color: #2ecc71;
      color: white;
    }

    .profile-actions button:last-child {
      background-color: #e74c3c;
      color: white;
    }

    .profile-actions button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .message {
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
      font-weight: bold;
      text-align: center;
    }

    .success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .loading-message,
    .error-message {
      text-align: center;
      padding: 2rem;
      color: #777;
    }

    .error-message {
      color: #e74c3c;
    }

    .anonymize-button {
      background-color: #e67e22;
      color: white;
    }

    .anonymize-button:hover:not(:disabled) {
      background-color: #d35400;
    }

    .anonymize-button:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .anonymize-button.requested {
      background-color: #95a5a6;
      cursor: default;
    }

    .anonymize-button.requested:hover {
      background-color: #95a5a6;
    }

    .order-history-button {
      background-color: #6c757d;
      color: white;
    }

    .order-history-button:hover {
      background-color: #5a6268;
    }
  `]
})
export class UserProfileComponent implements OnInit {
  userProfile: UserProfile | null = null;
  loadingError: string | null = null;
  isEditMode: boolean = false;
  profileForm: FormGroup;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  showDialog: boolean = false;

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      currentPassword: [''],
      newPassword: [''],
      confirmNewPassword: [''],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmNewPassword = form.get('confirmNewPassword')?.value;

    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      return { mismatch: true };
    }
    return null;
  }

  private loadUserProfile(): void {
    this.profileService.getUserProfile().subscribe({
      next: (profile: UserProfile) => {
        this.userProfile = profile;
        this.profileForm.patchValue({
          username: profile.username,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phoneNumber: profile.phoneNumber || '',
        });
        this.profileForm.disable();
        this.clearMessages();
      },
      error: (error: any) => {
        console.error('Error fetching user profile:', error);
        this.loadingError = 'Failed to load profile. Please try again later.';
        this.showErrorMessage('Failed to load profile. Please try again later.');
      }
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.profileForm.enable();
      this.profileForm.get('newPassword')?.setValidators([Validators.minLength(6)]);
      this.profileForm.get('confirmNewPassword')?.setValidators([Validators.minLength(6)]);
    } else {
      this.profileForm.disable();
      this.profileForm.get('newPassword')?.clearValidators();
      this.profileForm.get('confirmNewPassword')?.clearValidators();
      if (this.userProfile) {
        this.profileForm.patchValue({
          username: this.userProfile.username,
          firstName: this.userProfile.firstName,
          lastName: this.userProfile.lastName,
          email: this.userProfile.email,
          phoneNumber: this.userProfile.phoneNumber || '',
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
    }
    this.profileForm.updateValueAndValidity();
    this.clearMessages();
  }

  saveProfile(): void {
    this.clearMessages();

    if (this.profileForm.valid && this.userProfile) {
      const formValue = this.profileForm.value;
      const passwordChanged = formValue.currentPassword || formValue.newPassword || formValue.confirmNewPassword;

      if (passwordChanged) {
        if (formValue.newPassword !== formValue.confirmNewPassword) {
          this.showErrorMessage('New password and confirmation do not match.');
          return;
        }

        const changePasswordRequest: ChangePasswordRequest = {
          currentPassword: formValue.currentPassword,
          newPassword: formValue.newPassword,
          confirmNewPassword: formValue.confirmNewPassword
        };


        this.profileService.changePassword(changePasswordRequest).subscribe({
          next: (response: any) => {
            this.showSuccessMessage('Password changed successfully!');
            this.resetPasswordFields();
          },
          error: (error: any) => {
            console.error('Error changing password:', error);
            this.showErrorMessage('Failed to change password: ' + (error.error?.message || 'Unknown error'));
          }
        });
      }

      const updatedProfile: UserProfile = {
        ...this.userProfile!,
        username: formValue.username,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber
      };

      const profileFieldsChanged = 
        updatedProfile.username !== this.userProfile!.username ||
        updatedProfile.firstName !== this.userProfile!.firstName ||
        updatedProfile.lastName !== this.userProfile!.lastName ||
        updatedProfile.email !== this.userProfile!.email ||
        updatedProfile.phoneNumber !== this.userProfile!.phoneNumber;

      if (profileFieldsChanged) {
        this.profileService.updateUserProfile(updatedProfile).subscribe({
          next: (profile: UserProfile) => {
            this.userProfile = profile;
            this.showSuccessMessage('Profile updated successfully!');
          },
          error: (error: any) => {
            console.error('Error updating user profile:', error);
            this.showErrorMessage('Failed to update profile: ' + (error.error?.message || 'Unknown error'));
          }
        });
      }
      
      this.isEditMode = false;
      this.profileForm.disable();
    }
  }

  resetPasswordFields(): void {
    this.profileForm.get('currentPassword')?.setValue('');
    this.profileForm.get('newPassword')?.setValue('');
    this.profileForm.get('confirmNewPassword')?.setValue('');
    this.profileForm.get('newPassword')?.clearValidators();
    this.profileForm.get('confirmNewPassword')?.clearValidators();
    this.profileForm.updateValueAndValidity();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    if (this.userProfile) {
      this.profileForm.patchValue({
        username: this.userProfile.username,
        firstName: this.userProfile.firstName,
        lastName: this.userProfile.lastName,
        email: this.userProfile.email,
        phoneNumber: this.userProfile.phoneNumber || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
    this.profileForm.disable();
    this.resetPasswordFields();
    this.clearMessages();
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = null, 5000);
  }

  private showErrorMessage(message: string): void {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = null, 5000);
  }

  private clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  showAnonymizationDialog(): void {
    this.showDialog = true;
  }

  onAnonymizationSubmit(data: {reason: string, notes?: string}): void {
    this.profileService.requestAnonymization(data.reason, data.notes).subscribe({
      next: () => {
        this.showSuccessMessage('Anonymization request submitted successfully. It will be processed within 30 days as required by GDPR.');
        this.loadUserProfile(); // Reload profile to update the UI
        this.showDialog = false;
      },
      error: (error: any) => {
        console.error('Error requesting anonymization:', error);
        this.showErrorMessage('Failed to submit anonymization request: ' + (error.error?.message || 'Unknown error'));
      }
    });
  }

  onAnonymizationCancel(): void {
    this.showDialog = false;
  }

  viewOrderHistory(): void {
    this.router.navigate(['/orders']);
  }
} 