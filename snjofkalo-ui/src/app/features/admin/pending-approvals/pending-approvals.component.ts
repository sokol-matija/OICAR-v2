import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemsService } from '../../../core/services/items.service';
import { ItemWithDetails } from '../../../core/models/item.model';
import { SharedModule } from '../../../shared/shared.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatPaginatorModule
  ],
  templateUrl: './pending-approvals.component.html',
  styleUrls: ['./pending-approvals.component.css']
})
export class PendingApprovalsComponent implements OnInit {
  items: ItemWithDetails[] = [];
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 1;
  loading = false;

  constructor(
    private itemsService: ItemsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPendingItems();
  }

  loadPendingItems(): void {
    this.loading = true;

    this.itemsService.getPendingApprovals(this.currentPage, this.pageSize).subscribe(
      response => {
        this.items = response.items;
        this.totalCount = response.totalCount;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.loading = false;
      },
      error => {
        console.error('Error loading pending items:', error);
        this.snackBar.open(error.error?.message || 'Failed to load items', 'Close', { duration: 5000 });
        this.loading = false;
      }
    );
  }

  approveItem(itemId: number): void {
    this.loading = true;

    this.itemsService.approveItem(itemId.toString()).subscribe(
      response => {
        this.snackBar.open('Item approved successfully', 'Close', { duration: 5000 });
        this.loadPendingItems();
      },
      error => {
        console.error('Error approving item:', error);
        this.snackBar.open(error.error?.message || 'Failed to approve item', 'Close', { duration: 5000 });
        this.loading = false;
      }
    );
  }

  rejectItem(itemId: number): void {
    this.loading = true;

    this.itemsService.rejectItem(itemId.toString(), 'Rejected by admin').subscribe(
      response => {
        this.snackBar.open('Item rejected successfully', 'Close', { duration: 5000 });
        this.loadPendingItems();
      },
      error => {
        console.error('Error rejecting item:', error);
        this.snackBar.open(error.error?.message || 'Failed to reject item', 'Close', { duration: 5000 });
        this.loading = false;
      }
    );
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPendingItems();
    }
  }
}
