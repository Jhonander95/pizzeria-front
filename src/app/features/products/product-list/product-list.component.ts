import { Component, OnInit } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [NgFor ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
    });
  }
}
