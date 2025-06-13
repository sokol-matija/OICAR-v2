import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="landing-container">
      <div class="hero-section">
        <h1>Welcome to Snjofkalo Marketplace</h1>
        <p class="subtitle">Your one-stop shop for all your needs</p>
        
        <div class="features">
          <div class="feature-card">
            <mat-icon>shopping_cart</mat-icon>
            <h3>Easy Shopping</h3>
            <p>Browse through thousands of items from trusted sellers</p>
          </div>
          
          <div class="feature-card">
            <mat-icon>security</mat-icon>
            <h3>Secure Transactions</h3>
            <p>Safe and secure payment processing for all your purchases</p>
          </div>
          
          <div class="feature-card">
            <mat-icon>support_agent</mat-icon>
            <h3>24/7 Support</h3>
            <p>Our customer service team is always here to help</p>
          </div>
        </div>

        <div class="cta-buttons">
          <button mat-raised-button color="primary" routerLink="/login">
            <mat-icon>login</mat-icon>
            Login
          </button>
          <button mat-raised-button color="accent" routerLink="/register">
            <mat-icon>person_add</mat-icon>
            Register
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .landing-container {
      min-height: calc(100vh - 64px);
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
    }

    .hero-section {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
      padding: 4rem 2rem;
    }

    h1 {
      font-size: 3rem;
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .subtitle {
      font-size: 1.5rem;
      color: #34495e;
      margin-bottom: 3rem;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin: 4rem 0;
    }

    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-5px);
      }

      mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        color: #DAA520;
        margin-bottom: 1rem;
      }

      h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
      }

      p {
        color: #7f8c8d;
        line-height: 1.6;
      }
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 3rem;

      button {
        padding: 0.75rem 2rem;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        mat-icon {
          margin-right: 0.5rem;
        }
      }
    }

    @media (max-width: 768px) {
      .hero-section {
        padding: 2rem 1rem;
      }

      h1 {
        font-size: 2rem;
      }

      .subtitle {
        font-size: 1.2rem;
      }

      .features {
        grid-template-columns: 1fr;
      }

      .cta-buttons {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class LandingComponent {} 