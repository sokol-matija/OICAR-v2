import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { Item, ItemWithDetails } from '../../../core/models/item.model';
import { SharedModule } from '../../../shared/shared.module';
import { Router } from '@angular/router';
import { PagedApiResponse } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-admin-items',
  standalone: true,
  imports: [CommonModule, SharedModule],
  template: `
    <div class="admin-items-container">
      <h2>Item Management</h2>

      <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div *ngIf="items.length === 0 && !errorMessage">No items found.</div>

      <div *ngIf="items.length > 0" class="item-list">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Status</th>
              <th>Approved</th>
              <th>User Generated</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td>{{ item.idItem }}</td>
              <td>{{ item.title }}</td>
              <td>{{ item.description | truncate }}</td>
              <td>{{ item.price | currency }}</td>
              <td>{{ item.stockQuantity }}</td>
              <td>{{ item.categoryName || 'N/A' }}</td>
              <td>{{ item.itemStatus }}</td>
              <td>{{ item.isApproved ? 'Yes' : 'No' }}</td>
              <td>{{ item.isUserGenerated ? 'Yes' : 'No' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- NEW: Pending Approvals Button (Moved to be under the table and above pagination) -->
        <div class="button-container">
          <button class="pending-approvals-button" (click)="goToPendingApprovals()">
            Pending Approvals
          </button>
        </div>

        <div class="pagination">
          <button (click)="prevPage()" [disabled]="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button (click)="nextPage()" [disabled]="currentPage === totalPages">Next</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-items-container {
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
    .error-message {
      color: #d32f2f;
      background-color: #ffebee;
      border: 1px solid #ef9a9a;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
      text-align: center;
    }
    .item-list table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    .item-list th,
    .item-list td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    .item-list th {
      background-color: #e0e0e0;
      color: #333;
    }
    .item-list tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    .item-list tr:hover {
      background-color: #ddd;
    }
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 20px;
    }
    .pagination button {
      background-color: #DAA520; /* Dark yellow */
      color: white;
      border: none;
      padding: 8px 16px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 14px;
      margin: 0 5px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }
    .pagination button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .pagination button:hover:not(:disabled) {
      background-color: #B8860B; /* Darker yellow */
    }
    .pagination span {
      margin: 0 10px;
      font-weight: bold;
    }
    .button-container {
      display: block;
      text-align: left;
      margin-top: 15px;
      margin-bottom: 10px;
    }
    .pending-approvals-button {
      background-color: #DAA520; /* Dark yellow for pending approvals button */
      color: white;
      border: none;
      padding: 10px 20px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
      border-radius: 5px;
      transition: background-color 0.3s ease;
    }
    .pending-approvals-button:hover {
      background-color: #B8860B; /* Darker yellow on hover */
    }
  `]
})
export class AdminItemsComponent implements OnInit {
  items: ItemWithDetails[] = [];
  errorMessage: string | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit(): void {
    this.fetchItems();
  }

  fetchItems(): void {
    this.adminService.getAllItems(this.currentPage, this.pageSize).subscribe({
      next: (response: PagedApiResponse<ItemWithDetails[]>) => {
        if (response.success && response.data) {
          this.items = response.data.data;
          this.totalPages = response.data.totalPages;
          this.errorMessage = null;
        } else {
          this.errorMessage = response.message || 'Failed to load items.';
        }
      },
      error: (err: Error) => {
        this.errorMessage = err.message || 'An error occurred.';
        console.error('Error fetching items', err);
      }
    });
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchItems();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchItems();
    }
  }

  goToPendingApprovals(): void {
    this.router.navigate(['/admin/pending-approvals']);
  }
}
