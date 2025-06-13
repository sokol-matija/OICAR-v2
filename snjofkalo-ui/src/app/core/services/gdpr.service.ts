import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GDPRRequest, GDPRDataExport } from '../models/gdpr.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GDPRService {
  constructor(private http: HttpClient) {}

  // User endpoints
  requestDataExport(): Observable<GDPRRequest> {
    return this.http.post<GDPRRequest>(`${environment.apiUrl}/users/gdpr/export`, {});
  }

  requestAnonymization(): Observable<GDPRRequest> {
    return this.http.post<GDPRRequest>(`${environment.apiUrl}/users/gdpr/anonymize`, {});
  }

  requestDeletion(): Observable<GDPRRequest> {
    return this.http.post<GDPRRequest>(`${environment.apiUrl}/users/gdpr/delete`, {});
  }

  getMyGDPRRequests(): Observable<GDPRRequest[]> {
    return this.http.get<GDPRRequest[]>(`${environment.apiUrl}/users/gdpr/my-requests`);
  }

  getGDPRInfo(): Observable<{ policy: string; lastUpdated: Date }> {
    return this.http.get<{ policy: string; lastUpdated: Date }>(`${environment.apiUrl}/users/gdpr/info`);
  }

  // Admin endpoints
  getPendingGDPRRequests(): Observable<GDPRRequest[]> {
    return this.http.get<GDPRRequest[]>(`${environment.apiUrl}/users/gdpr/admin/pending`);
  }

  approveGDPRRequest(requestId: string, notes?: string): Observable<GDPRRequest> {
    return this.http.post<GDPRRequest>(`${environment.apiUrl}/users/gdpr/admin/approve/${requestId}`, { notes });
  }

  rejectGDPRRequest(requestId: string, notes: string): Observable<GDPRRequest> {
    return this.http.post<GDPRRequest>(`${environment.apiUrl}/users/gdpr/admin/reject/${requestId}`, { notes });
  }

  getDataExport(requestId: string): Observable<GDPRDataExport> {
    return this.http.get<GDPRDataExport>(`${environment.apiUrl}/users/gdpr/admin/export/${requestId}`);
  }
} 