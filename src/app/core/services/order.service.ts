import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from '../../features/products/product-list/product-list.component';


@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:8080/orders'; 

  constructor(private http: HttpClient) {}

  createPurchase(cart: CartItem[]): Observable<any> {
    const purchase = {
      products: cart,
      total: cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
    };
    console.log(purchase);
    
    return this.http.post(this.apiUrl, purchase);
  }

}
