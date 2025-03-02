import { Component, OnInit } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { NgFor, CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { OrderService } from '../../../core/services/order.service';
import { PrintService } from '../../../core/services/print.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [NgFor, CardModule, ButtonModule, ListboxModule, CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  cart: CartItem[] = [];
  imageUrl: string = "";
  total: number = 0;

  constructor(
    public productService: ProductService,
    private orderService: OrderService,
    private printService: PrintService
  ) {}

  ngOnInit() {
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
      console.log(data);
      console.log(this.products);
    });
  }

  addToCart(product: Product) {
    const cartItem = this.cart.find(item => item.product.id === product.id);
    if (cartItem) {
      cartItem.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
    this.calculateTotal();
    console.log(this.cart);
  }

  removeFromCart(product: Product) {
    const index = this.cart.findIndex(item => item.product.id === product.id);
    if (index > -1) {
      this.cart[index].quantity--;
      if (this.cart[index].quantity === 0) {
        this.cart.splice(index, 1);
      }
    }
    this.calculateTotal();
    console.log(this.cart);
  }

  incrementQuantity(product: Product) {
    const cartItem = this.cart.find(item => item.product.id === product.id);
    if (cartItem) {
      cartItem.quantity++;
      this.calculateTotal();
    }
  }

  decrementQuantity(product: Product) {
    const cartItem = this.cart.find(item => item.product.id === product.id);
    if (cartItem && cartItem.quantity > 1) {
      cartItem.quantity--;
      this.calculateTotal();
    }
  }

  calculateTotal() {
    this.total = this.cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }

  buy() {
    this.orderService.createPurchase(this.cart).subscribe(response => {
      console.log('Compra creada:', response);
      
      // Imprimir el recibo
      this.printService.printReceipt(this.cart, this.total, response.id);
      
      // Limpiar el carrito
      this.cart = [];
      this.total = 0;
    }, error => {
      console.error('Error al crear la compra:', error);
    });
  }

}
