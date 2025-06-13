import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ItemsService } from '../../../core/services/items.service';
import { ItemWithDetails } from '../../../core/models/item.model';
import { CartService } from '../../../core/services/cart.service';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDividerModule, MatChipsModule]
})
export class ItemDetailsComponent implements OnInit {
  item: ItemWithDetails | null = null;
  loading: boolean = true;
  error: string | null = null;
  quantity: number = 1;
  addToCartMessage: string | null = null;
  addToCartSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private itemsService: ItemsService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadItemDetails();
  }

  private loadItemDetails(): void {
    const itemId = this.route.snapshot.paramMap.get('id');
    if (!itemId) {
      this.error = 'Item ID not found';
      this.loading = false;
      return;
    }

    this.itemsService.getItemById(itemId).subscribe({
      next: (item: ItemWithDetails) => {
        this.item = item;
        // If primaryImage is not set, default to the first image in the gallery
        if (!this.item.primaryImage && this.item.images && this.item.images.length > 0) {
          this.setMainImage(this.item.images[0]);
        }
        this.loading = false;
      },
      error: (error: unknown) => {
        this.error = 'Failed to load item details';
        this.loading = false;
        console.error('Error loading item details:', error);
      }
    });
  }

  setMainImage(image: any): void {
    if (this.item) {
      this.item.primaryImage = image;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity(): void {
    if (this.item && this.quantity < this.item.stockQuantity) {
      this.quantity++;
    }
  }

  addToCart(): void {
    if (!this.item) return;

    this.cartService.addToCart(this.item.idItem, this.quantity).subscribe({
      next: (success: boolean) => {
        if (success) {
          this.addToCartSuccess = true;
          this.addToCartMessage = 'Item added to cart successfully!';
        } else {
          this.addToCartSuccess = false;
          this.addToCartMessage = 'Failed to add item to cart';
        }
      },
      error: (error: unknown) => {
        this.addToCartSuccess = false;
        this.addToCartMessage = 'Failed to add item to cart';
        console.error('Error adding to cart:', error);
      }
    });
  }
} 
