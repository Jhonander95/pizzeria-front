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

  getOpenOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?status=open`);
  }

  getTodayOrders(): Observable<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const params = {
      startDate: today.toISOString(),
      endDate: endOfDay.toISOString()
    };
    return this.http.get<any[]>(`${this.apiUrl}`, { params });
  }

  payOrder(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/pay`, {});
  }

  addProductsToOrder(orderId: number, payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${orderId}/products`, payload);
  }
}
