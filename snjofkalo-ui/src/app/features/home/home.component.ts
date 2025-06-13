import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ItemWithDetails } from '../../core/models/item.model';
import { BaseItemCategory } from '../../core/models/shared.types';
import { ItemsService } from '../../core/services/items.service';
import { CartService } from '../../core/services/cart.service';
import { CategoriesService } from 'src/app/core/services/categories.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  template: `
    <div class="home-container">
      <section class="hero-banner">
        <div class="hero-content">
          <h1>Discover Amazing Deals</h1>
          <p>Find everything you need, from electronics to fashion, all in one place.</p>
          <a routerLink="/items" class="call-to-action-btn">Shop Now</a>
        </div>
      </section>

      <section class="categories-section">
        <h2>Browse Categories</h2>
        <div class="categories-grid">
          <div *ngFor="let category of categories" class="category-card">
            <a [routerLink]="['/items']" [queryParams]="{ category: category.idItemCategory }" class="category-link">
              <h3>{{ category.categoryName }}</h3>
              <p>{{ category.description }}</p>
            </a>
          </div>
        </div>
      </section>

      <section class="featured-items">
        <h2>Featured Items</h2>
        <div class="items-grid">
          <div *ngFor="let item of featuredItems" class="item-card">
            <img [src]="item.images[0]?.imageData || 'assets/images/placeholder.jpg'" [alt]="item.title" class="item-image">
            <div class="item-details">
              <h3>{{ item.title }}</h3>
              <p class="price">{{ item.price | currency:'EUR' }}</p>
              <div class="actions">
                <a [routerLink]="['/items', item.idItem]" class="view-button">View Details</a>
                <button (click)="addToCart(item.idItem)" class="add-to-cart-button">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero-banner {
      background-size: cover;
      background-position: center;
      color: white;
      text-align: center;
      padding: 5rem 2rem;
      border-radius: 8px;
      margin-bottom: 3rem;
      position: relative;
      overflow: hidden;
    }

    .hero-banner::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.4); /* Dark overlay */
      z-index: 1;
    }

    .hero-content {
      position: relative;
      z-index: 2;
    }

    .hero-content h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .hero-content p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
    }

    .call-to-action-btn {
      background-color: #2ecc71;
      color: white;
      padding: 0.8rem 2rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: bold;
      transition: background-color 0.3s ease;
    }

    .call-to-action-btn:hover {
      background-color: #27ae60;
    }

    .categories-section,
    .featured-items {
      margin-bottom: 3rem;
    }

    h2 {
      text-align: center;
      font-size: 2rem;
      margin-bottom: 2rem;
      color: #333;
    }

    .categories-grid,
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 2rem;
    }

    .category-card,
    .item-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      overflow: hidden;
    }

    .category-card:hover,
    .item-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    .category-link {
      display: block;
      padding: 1.5rem;
      text-decoration: none;
      color: #333;
      height: 100%;
    }

    .category-card h3 {
      font-size: 1.4rem;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }

    .category-card p {
      font-size: 0.9rem;
      color: #666;
    }

    .item-image {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-bottom: 1px solid #eee;
    }

    .item-details {
      padding: 1rem;
    }

    .item-details h3 {
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }

    .price {
      font-size: 1.4rem;
      font-weight: bold;
      color: #28a745;
      margin-bottom: 1rem;
    }

    .actions {
      display: flex;
      gap: 0.8rem;
      margin-top: 1rem;
    }

    .view-button,
    .add-to-cart-button {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      text-align: center;
      font-weight: 600;
      transition: background-color 0.3s ease;
    }

    .view-button {
      background-color: #3498db;
      color: white;
      text-decoration: none;
    }

    .view-button:hover {
      background-color: #2980b9;
    }

    .add-to-cart-button {
      background-color: #2ecc71;
      color: white;
    }

    .add-to-cart-button:hover {
      background-color: #27ae60;
    }
  `]
})
export class HomeComponent implements OnInit {
  categories: BaseItemCategory[] = [];
  featuredItems: ItemWithDetails[] = [];

  constructor(
    private itemsService: ItemsService,
    private categoriesService: CategoriesService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadFeaturedItems();
  }

  private loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (categories: BaseItemCategory[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  private loadFeaturedItems(): void {
    this.itemsService.getFeaturedItems().subscribe({
      next: (items) => {
        this.featuredItems = Array.isArray(items) ? items : [];
      },
      error: (error) => {
        console.error('Error loading featured items:', error);
        this.featuredItems = [];
      }
    });
  }

  addToCart(itemId: number): void {
    this.cartService.addToCart(Number(itemId), 1).subscribe({
      next: () => {
      },
      error: (error: any) => {
        console.error('Error adding item to cart:', error);
      }
    });
  }
} 