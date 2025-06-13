import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  loading: boolean = false;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/items']);
    }
  }

  onLogin(): void {
    this.loading = true;
    this.error = null;


    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(['/items']); // Redirect to items on successful login
          }
        },
        error: (err) => {
          this.error = err.message || 'An unexpected error occurred during login.';
          this.loading = false;
          console.error('Login error:', err);
        }
      });
  }
} 