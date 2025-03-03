import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8080'; // URL to web api

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const userStr = localStorage.getItem('currentUser');
    console.log('Usuario almacenado:', userStr);

    let token: string;
    try {
      const user = JSON.parse(userStr || '{}');
      token = user.token;
      console.log('Token extraído:', token);
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      token = '';
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    console.log('Headers enviados:', headers.get('Authorization'));
    return headers;
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  addProduct(product: Product): Observable<Product> {
    const headers = this.getHeaders();
    return this.http.post<Product>(`${this.apiUrl}/admin/products`, product, { headers });
  }

  // For admin operations, we'll use the admin endpoints with authentication
  createProduct(product: Product): Observable<Product> {
    const headers = this.getHeaders();
    return this.http.post<Product>(`${this.apiUrl}/admin/products`, product, { headers });
  }

  editProduct(product: Product): Observable<Product> {
    const headers = this.getHeaders();
    return this.http.put<Product>(`${this.apiUrl}/admin/products/${product.id}`, product, { headers });
  }

  deleteProduct(id: string): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/admin/products/${id}`, { headers });
  }

  urlImage(product: Product): string {
    let imagePath: string;
  
    switch (product.category) {
      case 'pizzas':
        imagePath = 'assets/pizza.jpg';
        break;
      case 'bebidas':
        imagePath = 'assets/images/bebida.png';
        break;
      case 'panceroti':
        imagePath = 'assets/images/panceroti.png';
        break;
      default:
        imagePath = 'assets/images/default.png'; // Ruta por defecto
        break;
    }
  
    return imagePath;
  }


}
