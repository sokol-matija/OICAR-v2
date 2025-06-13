import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { Log } from '../../../core/models/user.model'; // Assuming Log is defined here

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-logs-container">
      <h2>System Logs</h2>
      <div *ngIf="logs.length === 0">No logs found.</div>
      <div *ngIf="logs.length > 0" class="log-list">
        <div *ngFor="let log of logs" class="log-item">
          <p><strong>Timestamp:</strong> {{ log.timestamp | date:'medium' }}</p>
          <p><strong>Level:</strong> <span [class.log-error]="log.level === 'ERROR'" [class.log-warn]="log.level === 'WARN'">{{ log.level }}</span></p>
          <p><strong>Message:</strong> {{ log.message }}</p>
          <p *ngIf="log.exception"><strong>Exception:</strong> {{ log.exception }}</p>
          <p *ngIf="log.action"><strong>Action:</strong> {{ log.action }}</p>
          <hr>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-logs-container {
      padding: 20px;
      max-width: 900px;
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
    .log-list {
      border: 1px solid #ddd;
      border-radius: 4px;
      max-height: 600px;
      overflow-y: auto;
      padding: 10px;
      background-color: #fff;
    }
    .log-item {
      margin-bottom: 15px;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    .log-item:last-child {
      border-bottom: none;
    }
    .log-item p {
      margin: 5px 0;
      line-height: 1.4;
      color: #555;
    }
    .log-item strong {
      color: #333;
    }
    .log-error {
      color: #d32f2f;
      font-weight: bold;
    }
    .log-warn {
      color: #fbc02d;
      font-weight: bold;
    }
  `]
})
export class AdminLogsComponent implements OnInit {
  logs: Log[] = [];
  errorMessage: string | null = null;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.fetchLogs();
  }

  fetchLogs(): void {
    this.adminService.getRecentLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load logs.';
        console.error('Error fetching logs', err);
      }
    });
  }
}
