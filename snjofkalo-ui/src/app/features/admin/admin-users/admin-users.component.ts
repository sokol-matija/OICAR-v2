import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { UserListResponse } from '../../../core/models/shared.types';
import { AuthService } from '../../../core/services/auth.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { Observable, catchError, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatSnackBarModule],
  template: `
    <div class="admin-users-container">
      <h2>User Management</h2>

      <div *ngIf="users.length === 0 && !errorMessage">No users found.</div>

      <div *ngIf="users.length > 0" class="user-list">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Is Admin</th>
                <th>Is Seller</th>
                <th>Promote</th>
                <th>Delete</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <ng-container *ngFor="let user of users">
                <tr class="main-row">
                  <td>{{ user.idUser }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.firstName }}</td>
                  <td>{{ user.lastName }}</td>
                  <td>{{ user.isAdmin ? 'Yes' : 'No' }}</td>
                  <td>{{ user.isSeller ? 'Yes' : 'No' }}</td>
                  <td>
                    <button 
                      mat-button
                      class="promote-button"
                      [disabled]="user.isAdmin"
                      (click)="promoteUser(user.idUser)">
                      Promote
                    </button>
                  </td>
                  <td>
                    <button 
                      mat-button
                      class="delete-button"
                      [disabled]="user.isAdmin"
                      (click)="deleteUser(user.idUser)">
                      Delete
                    </button>
                  </td>
                  <td>
                    <button mat-button class="toggle-button" (click)="toggleRow(user)">
                      {{ user.isExpanded ? 'Collapse' : 'Expand' }}
                    </button>
                  </td>
                </tr>
                <tr *ngIf="user.isExpanded" class="detail-row">
                  <td colspan="10">
                    <div class="detail-content">
                      <div class="detail-item">
                        <strong>Anonymization Requested:</strong> {{ user.requestedAnonymization ? 'Yes' : 'No' }}
                      </div>
                      <div class="detail-item">
                        <strong>Request Date:</strong> {{ user.anonymizationRequestDate ? (user.anonymizationRequestDate | date:'medium') : 'N/A' }}
                      </div>
                      <div class="detail-item">
                        <strong>Reason:</strong> <span class="text-cell">{{ user.anonymizationReason || 'N/A' }}</span>
                      </div>
                      <div class="detail-item">
                        <strong>Notes:</strong> <span class="text-cell">{{ user.anonymizationNotes || 'N/A' }}</span>
                      </div>
                      <div class="detail-actions">
                        <button 
                          mat-button
                          class="approve-button"
                          [disabled]="!user.requestedAnonymization"
                          (click)="approveAnonymization(user.idUser)">
                          Approve Anonymization
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button mat-button (click)="prevPage()" [disabled]="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button mat-button (click)="nextPage()" [disabled]="currentPage === totalPages">Next</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-users-container {
      padding: 20px;
      max-width: 1200px;
      margin: 20px auto;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    h2 {
      color: #333;
      text-align: center;
      margin-bottom: 20px;
    }
    .user-list {
      padding: 20px;
    }
    .table-container {
      overflow-x: auto;
    }
    table {
      width: 100%;
      min-width: fit-content;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
      white-space: nowrap;
    }
    th {
      background-color: #f2f2f2;
      cursor: pointer;
      white-space: nowrap;
      padding: 10px 12px;
    }
    .main-row {
      background-color: #ffffff;
    }
    .detail-row {
      background-color: #f9f9f9;
    }
    .detail-content {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .detail-item {
      white-space: normal;
      margin-bottom: 8px;
    }
    .detail-item strong {
      display: inline-block;
      font-weight: bold;
      margin-right: 5px;
    }
    .detail-actions {
      display: flex;
      gap: 5px;
    }
    .text-cell {
      max-width: 300px;
      white-space: normal;
      word-wrap: break-word;
      line-height: 1.4;
      padding: 0;
    }
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 20px;
      gap: 10px;
    }
    .promote-button {
      background-color: #DAA520;
      color: white;
    }
    .delete-button {
      background-color: #dc3545;
      color: white;
    }
    .approve-button {
      background-color: #DAA520;
      color: white;
    }
    .toggle-button {
      background-color: #6c757d;
      color: white;
    }
    button {
      padding: 6px 12px;
      margin: 0 4px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }

    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    button:not(:disabled):hover {
      opacity: 0.9;
    }

    button[class*="anonymize"] {
      background-color: #007bff;
      color: white;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: UserListResponse[] = [];
  currentPage: number = 1;
  pageSize: number = 20;
  totalCount: number = 0;
  totalPages: number = 0;
  errorMessage: string | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.adminService.getUsers(this.currentPage, this.pageSize).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.users = response.data.data;
          this.totalCount = response.data.totalCount;
          this.totalPages = response.data.totalPages;
          this.errorMessage = null;
        } else {
          this.errorMessage = response.message || 'Failed to load users';
          this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        }
      }),
      catchError(error => {
        const errorMsg = error.message || 'Failed to load users';
        this.errorMessage = errorMsg;
        this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
        return of(null);
      })
    ).subscribe();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchUsers();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchUsers();
    }
  }

  promoteUser(userId: number): void {
    this.adminService.getUserById(userId).pipe(
      switchMap(response => {
        if (response.success && response.data) {
          const updateRequest = {
            username: response.data.username,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            email: response.data.email,
            isAdmin: true
          };
          return this.adminService.promoteUser(userId, updateRequest);
        }
        throw new Error('Failed to get user details');
      }),
      tap(response => {
        if (response.success) {
          this.snackBar.open('User promoted successfully', 'Close', { duration: 5000 });
          this.fetchUsers();
        } else {
          this.snackBar.open(response.message || 'Failed to promote user', 'Close', { duration: 5000 });
        }
      }),
      catchError(error => {
        this.snackBar.open(error.message || 'Failed to promote user', 'Close', { duration: 5000 });
        return of(null);
      })
    ).subscribe();
  }

  deleteUser(userId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this user?'
      }
    });

    dialogRef.afterClosed().pipe(
      switchMap(result => {
        if (result) {
          return this.adminService.deleteUser(userId);
        }
        return of(null);
      }),
      tap(response => {
        if (response?.success) {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 5000 });
          this.fetchUsers();
        } else if (response) {
          this.snackBar.open(response.message || 'Failed to delete user', 'Close', { duration: 5000 });
        }
      }),
      catchError(error => {
        this.snackBar.open(error.message || 'Failed to delete user', 'Close', { duration: 5000 });
        return of(null);
      })
    ).subscribe();
  }

  approveAnonymization(userId: number): void {
    this.adminService.approveAnonymization(userId).pipe(
      tap(response => {
        if (response.success) {
          this.snackBar.open('Anonymization approved successfully', 'Close', { duration: 5000 });
          this.fetchUsers();
        } else {
          this.snackBar.open(response.message || 'Failed to approve anonymization', 'Close', { duration: 5000 });
        }
      }),
      catchError(error => {
        this.snackBar.open(error.message || 'Failed to approve anonymization', 'Close', { duration: 5000 });
        return of(null);
      })
    ).subscribe();
  }

  toggleRow(user: UserListResponse): void {
    user.isExpanded = !user.isExpanded;
  }
}
