import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flavor } from '../models/flavor.model';

@Injectable({
  providedIn: 'root',
})
export class FlavorService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const userStr = localStorage.getItem('currentUser');
    let token = '';
    try {
      token = JSON.parse(userStr || '{}').token || '';
    } catch {
      token = '';
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getFlavors(): Observable<Flavor[]> {
    return this.http.get<Flavor[]>(`${this.apiUrl}/flavors`);
  }

  createFlavor(flavor: Flavor): Observable<Flavor> {
    return this.http.post<Flavor>(`${this.apiUrl}/admin/flavors`, flavor, { headers: this.getHeaders() });
  }

  editFlavor(flavor: Flavor): Observable<Flavor> {
    return this.http.put<Flavor>(`${this.apiUrl}/admin/flavors/${flavor.id}`, flavor, { headers: this.getHeaders() });
  }

  deleteFlavor(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/flavors/${id}`, { headers: this.getHeaders() });
  }
}
