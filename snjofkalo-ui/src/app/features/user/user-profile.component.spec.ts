import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './user-profile.component';
import { ProfileService } from '../../core/services/profile.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserProfile } from '../../core/models/user.model';
import { AnonymizationRequestDialogComponent } from './anonymization-request-dialog.component';
import { Location } from '@angular/common';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let router: Router;
  let location: Location;

  const mockUserProfile: UserProfile = {
    idUser: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    isSeller: false,
    requestedAnonymization: false,
    isAdmin: false,
    failedLoginAttempts: 0
  };

  beforeEach(async () => {
    mockProfileService = jasmine.createSpyObj('ProfileService', [
      'getUserProfile',
      'updateUserProfile',
      'changePassword',
      'requestAnonymization'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        UserProfileComponent,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: 'orders', component: UserProfileComponent }
        ])
      ],
      providers: [
        { provide: ProfileService, useValue: mockProfileService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    mockProfileService.getUserProfile.and.returnValue(of(mockUserProfile));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user profile on init', () => {
    expect(mockProfileService.getUserProfile).toHaveBeenCalled();
    expect(component.userProfile).toEqual(mockUserProfile);
  });

  it('should handle profile loading error', fakeAsync(() => {
    const errorMessage = 'Failed to load profile';
    mockProfileService.getUserProfile.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));
    
    component.ngOnInit();
    fixture.detectChanges();
    tick(5000); // Wait for error message timeout
    
    expect(component.loadingError).toContain(errorMessage);
  }));

  it('should toggle edit mode', () => {
    component.toggleEditMode();
    expect(component.isEditMode).toBeTrue();
    expect(component.profileForm.enabled).toBeTrue();

    component.toggleEditMode();
    expect(component.isEditMode).toBeFalse();
    expect(component.profileForm.disabled).toBeTrue();
  });

  it('should save profile changes', fakeAsync(() => {
    const updatedProfile = { ...mockUserProfile, firstName: 'Updated' };
    mockProfileService.updateUserProfile.and.returnValue(of(updatedProfile));
    
    component.toggleEditMode();
    component.profileForm.patchValue({
      username: updatedProfile.username,
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      email: updatedProfile.email,
      phoneNumber: updatedProfile.phoneNumber
    });
    
    component.saveProfile();
    fixture.detectChanges();
    tick(5000); // Wait for success message timeout
    
    expect(mockProfileService.updateUserProfile).toHaveBeenCalledWith(updatedProfile);
    expect(component.userProfile).toEqual(updatedProfile);
    expect(component.isEditMode).toBeFalse();
  }));

  it('should change password', fakeAsync(() => {
    const passwordData = {
      currentPassword: 'oldpass',
      newPassword: 'newpass',
      confirmNewPassword: 'newpass'
    };
    mockProfileService.changePassword.and.returnValue(of({}));
    
    component.toggleEditMode();
    component.profileForm.patchValue(passwordData);
    
    component.saveProfile();
    fixture.detectChanges();
    tick(5000); // Wait for success message timeout
    
    expect(mockProfileService.changePassword).toHaveBeenCalledWith(passwordData);
    expect(component.isEditMode).toBeFalse();
  }));

  it('should handle password change error', fakeAsync(() => {
    const errorMessage = 'Invalid password';
    mockProfileService.changePassword.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));
    
    component.toggleEditMode();
    component.profileForm.patchValue({
      currentPassword: 'oldpass',
      newPassword: 'newpass',
      confirmNewPassword: 'newpass'
    });
    
    component.saveProfile();
    fixture.detectChanges();
    
    // Check error message immediately after the error occurs
    expect(component.errorMessage).toContain(errorMessage);
    
    // Now wait for the timeout to clear the message
    tick(5000);
    expect(component.errorMessage).toBeNull();
  }));

  it('should navigate to order history', fakeAsync(() => {
    component.viewOrderHistory();
    tick();
    expect(location.path()).toBe('/orders');
  }));

  it('should show anonymization dialog', () => {
    component.showAnonymizationDialog();
    expect(component.showDialog).toBeTrue();
  });

  it('should handle anonymization request', fakeAsync(() => {
    const requestData = { reason: 'test reason', notes: 'test notes' };
    mockProfileService.requestAnonymization.and.returnValue(of({}));
    
    component.onAnonymizationSubmit(requestData);
    fixture.detectChanges();
    tick(5000); // Wait for success message timeout
    
    expect(mockProfileService.requestAnonymization).toHaveBeenCalledWith(requestData.reason, requestData.notes);
    expect(component.showDialog).toBeFalse();
  }));

  it('should cancel anonymization dialog', () => {
    component.showDialog = true;
    component.onAnonymizationCancel();
    expect(component.showDialog).toBeFalse();
  });
}); 