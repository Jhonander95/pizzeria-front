import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../core/services/sales.service';


// PrimeNG imports
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

// Interfaces
export interface Sale {
  id: number;
  products: OrderProduct[];
  total: number;
  created_at: string;
}

export interface OrderProduct {
  order_id: number;
  product_id: number;
  product: Product;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  status: boolean;
}

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CalendarModule,
    ButtonModule,
    DropdownModule
  ],
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.scss'
})
export class SalesReportComponent implements OnInit {
  sales: Sale[] = [];
  rangeDates: Date[] = [];
  totalAmount: number = 0;
  loading: boolean = false;

  constructor(private salesService: SalesService) {}

  ngOnInit() {
    // Establecer fecha inicial como el primer día del mes actual
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.rangeDates = [firstDay, today];
    this.loadSales();
  }

  loadSales() {
    if (!this.rangeDates[0] || !this.rangeDates[1]) {
      return;
    }

    this.loading = true;
    this.salesService.getSales(this.rangeDates[0], this.rangeDates[1])
      .subscribe({
        next: (data) => {
          this.sales = data;
          this.calculateTotal();
        },
        error: (error) => {
          console.error('Error cargando ventas:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  calculateTotal() {
    this.totalAmount = this.sales.reduce((sum, sale) => sum + sale.total, 0);
  }

  getProductDetails(products: OrderProduct[]): string {
    return products.map(p => 
      `${p.quantity}x ${p.product.name} ($${p.product.price.toLocaleString('es-CO')})`
    ).join(', ');
  }

  onDateChange() {
    if (this.rangeDates[0] && this.rangeDates[1]) {
      this.loadSales();
    }
  }
}
