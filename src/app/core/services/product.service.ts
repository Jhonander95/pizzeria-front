import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/products'; // URL to web api

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
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
