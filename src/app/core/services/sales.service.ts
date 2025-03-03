import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = 'http://localhost:8080/orders';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const userStr = localStorage.getItem('currentUser');
    let token: string;
    try {
      const user = JSON.parse(userStr || '{}');
      token = user.token;
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      token = '';
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getSales(startDate: Date, endDate: Date): Observable<any[]> {
    const headers = this.getHeaders();
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    return this.http.get<any[]>(`${this.apiUrl}`, { headers, params });
  }
}
