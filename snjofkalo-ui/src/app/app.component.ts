import { Component, OnInit, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs'; // Import Subscription for cleanup
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, MatIconModule],
  template: `
    <header class="navbar">
      <div class="container">
        <a routerLink="/" class="logo">Snjofkalo Marketplace</a>
        <nav class="nav-links">
          <ng-container *ngIf="authService.isLoggedIn()">
            <a routerLink="/items" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon>home</mat-icon>
              Items
            </a>
            <a routerLink="/cart" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon>shopping_cart</mat-icon>
              Cart
            </a>
            <a routerLink="/profile" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon>person</mat-icon>
              Profile
            </a>
          </ng-container>

          <ng-container *ngIf="authService.isLoggedIn()">
            <!-- Admin Dropdown -->
            <div class="admin-dropdown" 
                 *ngIf="authService.currentUserValue?.user?.isAdmin"
                 (mouseleave)="hideAdminDropdownWithDelay()">
              <button class="admin-button" (click)="toggleAdminDropdown($event)">
                <mat-icon>admin_panel_settings</mat-icon>
                Admin
              </button>
              <div class="dropdown-menu" 
                   *ngIf="showAdminDropdown" 
                   (click)="$event.stopPropagation()"
                   (mouseenter)="clearAdminDropdownCloseTimer()">
                <a routerLink="/admin/logs" routerLinkActive="active" (click)="showAdminDropdown = false">
                  <mat-icon>list_alt</mat-icon>
                  Logs
                </a>
                <a routerLink="/admin/users" routerLinkActive="active" (click)="showAdminDropdown = false">
                  <mat-icon>people</mat-icon>
                  Users
                </a>
                <a routerLink="/admin/items" routerLinkActive="active" (click)="showAdminDropdown = false">
                  <mat-icon>inventory_2</mat-icon>
                  Items
                </a>
              </div>
            </div>

            <a (click)="logout()">
              <mat-icon>logout</mat-icon>
              Logout
            </a>
          </ng-container>
          <ng-container *ngIf="!authService.isLoggedIn()">
            <a routerLink="/login" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon>login</mat-icon>
              Login
            </a>
            <a routerLink="/register" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon>person_add</mat-icon>
              Register
            </a>
          </ng-container>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>

    <footer class="footer">
      <div class="container">
        <p>&copy; {{ currentYear }} Snjofkalo Marketplace. All rights reserved.</p>
        <nav class="footer-links">
          <a routerLink="/privacy-policy">Privacy Policy</a>
          <a routerLink="/terms-of-service">Terms of Service</a>
        </nav>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .navbar {
      background-color: #2c3e50;
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    .navbar .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      text-decoration: none;
    }

    .nav-links {
      display: flex; /* Use flexbox for spacing */
      align-items: center;
    }

    .nav-links a, .admin-button {
      color: white;
      text-decoration: none;
      padding: 0.75rem 1rem; /* Consistent padding */
      font-weight: 500;
      transition: background-color 0.3s ease, color 0.3s ease;
      cursor: pointer;
      border-radius: 4px; /* Slightly rounded corners */
      background-color: transparent; /* Default background */
      border: none; /* Remove default button border */
      font-size: 1rem; /* Consistent font size */
      white-space: nowrap; /* Prevent text wrapping */
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-links a mat-icon, .admin-button mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .nav-links a:hover, .admin-button:hover {
      background-color: #34495e; /* Keep dark background hover for now */
      color: #ffffff;
    }

    .nav-links a.active {
      background-color: #DAA520; /* Dark yellow for active link */
      font-weight: bold;
    }

    /* Admin Dropdown Styles */
    .admin-dropdown {
      position: relative;
      display: inline-block;
      margin-left: 1.5rem; /* Maintain spacing with other links */
    }

    .dropdown-menu {
      position: absolute;
      background-color: #2c3e50; /* Same as navbar background */
      min-width: 160px;
      box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.4);
      z-index: 1000; /* Ensure it appears above other content */
      border-radius: 4px;
      overflow: hidden; /* For rounded corners */
      top: calc(100% + 5px); /* Position below the button */
      left: 0; /* Align with the button */
      display: flex;
      flex-direction: column;
      padding: 5px 0;
    }

    .dropdown-menu a {
      color: white;
      padding: 12px 16px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-align: left;
      margin-left: 0; /* Override default margin */
      width: 100%;
      box-sizing: border-box; /* Include padding in width */
    }

    .dropdown-menu a mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }

    .dropdown-menu a:hover {
      background-color: #B8860B; /* Darker yellow on hover for dropdown items */
    }

    .main-content {
      flex: 1;
      padding: 2rem 0;
      background-color: #F9F9F9; /* Subtle background change */
    }

    .footer {
      background-color: #34495e;
      color: white;
      padding: 1.5rem 0;
      text-align: center;
    }

    .footer .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }

    .footer p {
      margin: 0;
      font-size: 0.9rem;
    }

    .footer-links a {
      color: white;
      text-decoration: none;
      margin-left: 1rem;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .footer-links a:hover {
      color: #3498db;
    }

    @media (max-width: 768px) {
      .navbar .container {
        flex-direction: column;
        align-items: flex-start;
      }

      .nav-links {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .nav-links a, .admin-button {
        margin: 0.5rem 0;
        width: 100%;
        text-align: left;
      }

      .admin-dropdown {
        margin-left: 0; /* Remove horizontal margin for mobile */
        width: 100%;
      }

      .dropdown-menu {
        position: static; /* Allow dropdown to flow in mobile */
        width: 100%;
        box-shadow: none; /* No shadow needed for static dropdown */
        padding-left: 20px; /* Indent dropdown items */
        top: auto;
        left: auto;
      }

      .footer .container {
        flex-direction: column;
        text-align: center;
      }

      .footer-links {
        margin-top: 1rem;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Snjofkalo Marketplace';
  currentYear = new Date().getFullYear();
  showAdminDropdown: boolean = false;
  private dropdownCloseTimer: any; // Timer for delayed closing
  private routerSubscription: Subscription = Subscription.EMPTY; // Initialized to avoid 'definitely assigned' error

  constructor(public authService: AuthService, private router: Router, private elementRef: ElementRef) { }

  ngOnInit() {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Hide dropdown on route change
      this.showAdminDropdown = false;
      this.clearAdminDropdownCloseTimer(); // Clear any pending timers
    });

    // Log isAdmin status on component initialization
    console.log('AppComponent - Is Admin:', this.authService.isAdmin());
    // Log currentUserValue for detailed inspection
    console.log('AppComponent - Current User Value:', this.authService.currentUserValue);
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.clearAdminDropdownCloseTimer();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleAdminDropdown(event: Event): void {
    this.showAdminDropdown = !this.showAdminDropdown;
    event.stopPropagation(); // Stop propagation for button click
    this.clearAdminDropdownCloseTimer(); // Clear timer if opening
  }

  @HostListener('document:click', ['$event']) // Listen for clicks anywhere on the document
  clickOutside(event: Event) {
    // Check if the click was outside the dropdown and its button
    // Use elementRef.nativeElement.contains to check if the click target is within the component
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showAdminDropdown = false;
      this.clearAdminDropdownCloseTimer();
    }
  }

  hideAdminDropdownWithDelay(): void {
    this.clearAdminDropdownCloseTimer(); // Clear any existing timer
    this.dropdownCloseTimer = setTimeout(() => {
      this.showAdminDropdown = false;
    }, 200); // 200ms delay
  }

  clearAdminDropdownCloseTimer(): void {
    if (this.dropdownCloseTimer) {
      clearTimeout(this.dropdownCloseTimer);
      this.dropdownCloseTimer = null;
    }
  }
} 