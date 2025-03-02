import { Injectable } from '@angular/core';
import { Product } from '../../../core/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor() { }

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
