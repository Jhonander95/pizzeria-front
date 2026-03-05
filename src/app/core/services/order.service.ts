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
    const products = cart.map(item => {
      const productPayload: any = {
        product: { id: item.product.id },
        quantity: item.quantity
      };
      if (item.flavors && item.flavors.length > 0) {
        productPayload.flavor_count = item.flavor_count || item.flavors.length;
        productPayload.flavors = item.flavors.map(f => ({ id: f.id }));
      }
      return productPayload;
    });

    const purchase = {
      products,
      total: cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
    };
    console.log('Payload enviado:', purchase);
    
    return this.http.post(this.apiUrl, purchase);
  }

}
