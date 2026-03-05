import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = 'http://localhost:8080/company';
  private adminUrl = 'http://localhost:8080/admin/company';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const userStr = localStorage.getItem('currentUser');
    let token = '';
    try {
      const user = JSON.parse(userStr || '{}');
      token = user.token || '';
    } catch (error) {
      console.error('Error al parsear usuario:', error);
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getCompany(): Observable<Company> {
    return this.http.get<Company>(this.apiUrl);
  }

  saveCompany(company: Company): Observable<Company> {
    return this.http.put<Company>(this.adminUrl, company, { headers: this.getHeaders() });
  }
}
