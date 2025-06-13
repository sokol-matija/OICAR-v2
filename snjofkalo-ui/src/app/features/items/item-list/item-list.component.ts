import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemsService } from '../../../core/services/items.service';
import { ItemWithDetails } from '../../../core/models/item.model';
import { ItemRequestFormComponent } from '../item-request-form/item-request-form.component';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { SharedModule } from '../../../shared/shared.module';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ItemRequestFormComponent, 
    SharedModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit {
  items: ItemWithDetails[] = [];
  categories: any[] = [];
  selectedCategory: number | null = null;
  searchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 12;
  totalPages: number = 1;
  totalItems: number = 0;
  loading: boolean = false;
  sortBy: string = '';
  showRequestForm = false;
  isAdmin = false;
  currentUserId: number | null = null;

  itemAddToCartFeedback: { [itemId: number]: { message: string, success: boolean } } = {};

  constructor(
    private itemsService: ItemsService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadItems();
    this.loadCategories();
    this.checkAdminStatus();
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser ? currentUser.idUser : null;
  }

  private checkAdminStatus(): void {
    this.isAdmin = this.authService.isAdmin();
  }

  loadItems(): void {
    const params = {
      searchQuery: this.searchQuery,
      categoryId: this.selectedCategory || undefined,
      sortBy: this.sortBy,
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };
    console.log('Loading items with params:', params);

    this.itemsService.getItems(params).subscribe({
      next: (response) => {
        console.log('Items API Response:', response);
        this.items = response.items;
        this.totalPages = response.totalPages;
        this.totalItems = response.totalItems;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load items. Please try again.'
        });
      }
    });
  }

  loadCategories(): void {
    this.itemsService.getCategories().subscribe((response: any) => {
      if (Array.isArray(response)) {
        this.categories = response;
      } else if (response && response.items && Array.isArray(response.items)) {
        this.categories = response.items;
      } else if (response && typeof response === 'object') {
        this.categories = Object.values(response);
      }
    });
  }

  onSearch(): void {
    console.log('Search triggered with query:', this.searchQuery);
    this.currentPage = 1;
    this.loadItems();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadItems();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadItems();
    }
  }

  addToCart(itemId: number): void {
    this.cartService.addToCart(itemId, 1).subscribe(
      response => {
        this.itemAddToCartFeedback[itemId] = {
          message: 'Item added to cart successfully!',
          success: true
        };
        setTimeout(() => {
          delete this.itemAddToCartFeedback[itemId];
        }, 3000);
      },
      error => {
        this.itemAddToCartFeedback[itemId] = {
          message: error.error?.message || 'Failed to add item to cart',
          success: false
        };
        setTimeout(() => {
          delete this.itemAddToCartFeedback[itemId];
        }, 3000);
      }
    );
  }

  openRequestForm(): void {
    this.showRequestForm = true;
  }

  onRequestFormClose(): void {
    this.showRequestForm = false;
  }

  onRequestSubmitted(): void {
    this.showRequestForm = false;
    this.loadItems();
  }

  isOwnItem(item: ItemWithDetails): boolean {
    return item.sellerUserID?.toString() !== this.currentUserId?.toString();
  }

  navigateToItemDetails(itemId: number): void {
    this.router.navigate(['/items', itemId]);
  }
} 